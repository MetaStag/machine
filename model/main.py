import requests
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.ensemble import IsolationForest
from sklearn.svm import OneClassSVM
from statsmodels.tsa.seasonal import seasonal_decompose
from sklearn.preprocessing import StandardScaler, MinMaxScaler
import time
import os

# Function to fetch historical data for top 5 cryptocurrencies
def fetch_historical_data(coin_ids, days=160, interval='hourly'):
    """
    Fetch historical data for the given cryptocurrencies from CoinGecko API.
    """
    historical_data = {}
    for coin in coin_ids:
        url = f"https://api.coingecko.com/api/v3/coins/{coin}/market_chart?vs_currency=usd&days={days}"
        attempts = 3
        while attempts > 0:
            try:
                response = requests.get(url)
                data = response.json()
                timestamps = [item[0] for item in data['prices']]
                prices = [item[1] for item in data['prices']]
                volumes = [item[1] for item in data['total_volumes']]

                # Store data in a DataFrame
                df = pd.DataFrame({
                    'timestamp': pd.to_datetime(timestamps, unit='ms'),
                    'price': prices,
                    'volume': volumes
                })
                historical_data[coin] = df
                break
            except Exception as e:
                print(f"Error fetching data for {coin}: {e}")
                attempts -= 1
                time.sleep(5)
                if attempts == 0:
                    print(f"Failed to fetch data for {coin}. Skipping.")
    return historical_data

# Top 5 cryptocurrencies by market cap
top_5_coins = ['bitcoin', 'ethereum', 'ripple', 'cardano', 'solana']

# Fetch historical data for the top 5 coins with hourly data for the past 365 days
data = fetch_historical_data(top_5_coins, days=160)

# Preprocess the data
def preprocess_data(data):
    """
    Preprocess the historical data with normalization and handling missing values.
    """
    for coin, df in data.items():
        # Sort by timestamp to ensure chronological order
        df.sort_values('timestamp', inplace=True)
        df.set_index('timestamp', inplace=True)

        # Interpolation to fill missing values
        df.interpolate(method='linear', inplace=True)

        # Normalize price and volume (use StandardScaler or MinMaxScaler)
        #scaler = StandardScaler()
        #df[['price', 'volume']] = scaler.fit_transform(df[['price', 'volume']])
    
    return data

processed_data = preprocess_data(data)

# Define normal behavior using rolling mean and std dev (for price)
def define_normal_behavior(data):
    """
    Define normal behavior for the historical data using rolling mean and standard deviation.
    """
    normal_behavior = {}
    for coin, df in data.items():
        df['price_mean'] = df['price'].rolling(window=30).mean()  # 30-day rolling mean
        df['price_std'] = df['price'].rolling(window=30).std()  # 30-day rolling std deviation
        normal_behavior[coin] = df
    return normal_behavior

normal_behavior = define_normal_behavior(processed_data)

# Model-based anomaly detection (Isolation Forest)
def isolation_forest_anomaly_detection(data, contamination=0.1):
    anomalies = {}
    
    for coin, df in data.items():
        # Feature Engineering
        df['price_change_pct'] = df['price'].pct_change() * 100  # Percentage change
        df['rolling_std'] = df['price'].rolling(window=14).std()  # 14-day rolling std
        df['rsi'] = compute_rsi(df['price'], window=14)  # Compute RSI

        # Drop NaN values after computing new features
        df.dropna(inplace=True)

        # Select relevant features
        feature_columns = ['price', 'volume', 'price_change_pct', 'rolling_std', 'rsi']
        model = IsolationForest(contamination=contamination, n_estimators=200, random_state=42)

        # Fit and predict anomalies
        df['anomaly'] = model.fit_predict(df[feature_columns])
        anomalies[coin] = df[df['anomaly'] == -1]  # -1 indicates anomaly

    return anomalies

# Function to compute RSI (Relative Strength Index)
def compute_rsi(prices, window=14):
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))


# Visualize anomalies
def plot_anomalies(data, anomalies):
    """
    Plot the anomalies detected for each cryptocurrency.
    """
    for coin, df in data.items():
        plt.figure(figsize=(10, 6))
        plt.plot(df.index, df['price'], label='Price')

        # Plot anomalies
        anomaly_dates = anomalies.get(coin, pd.DataFrame()).index
        plt.scatter(anomaly_dates, df.loc[anomaly_dates, 'price'], color='red', label='Anomalies')

        plt.title(f'{coin.capitalize()} Price with Anomalies')
        plt.xlabel('Date')
        plt.ylabel('Price (USD)')
        plt.legend()
        save_path = f"./plots/{coin}.png"
        plt.savefig(save_path)
        plt.show()

# Function to save data to CSV
def save_data_to_csv(data, output_dir='crypto_data'):
    """
    Save processed data to CSV files.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for coin, df in data.items():
        file_path = os.path.join(output_dir, f"{coin}_data.csv")
        df.to_csv(file_path)
        print(f"Saved data for {coin} to {file_path}")

# Execute the boosted isolation forest
def boosted_isolation_forest(data, n_iterations=10, learning_rate=0.1, contamination=0.1):
    """
    Implements boosted isolation forest for anomaly detection
    """
    anomalies = {}
    feature_importance = {}
    
    for coin, df in data.items():
        # Feature Engineering
        df['price_change'] = df['price'].pct_change()
        df['volume_change'] = df['volume'].pct_change()
        df['rolling_mean_5'] = df['price'].rolling(window=5).mean()
        df['rolling_mean_20'] = df['price'].rolling(window=20).mean()
        df['rolling_std_5'] = df['price'].rolling(window=5).std()
        df['rsi'] = compute_rsi(df['price'])
        
        # Drop NaN values
        df.dropna(inplace=True)
        
        # Initialize features
        features = ['price', 'volume', 'price_change', 'volume_change',
                   'rolling_mean_5', 'rolling_mean_20', 'rolling_std_5', 'rsi']
        
        # Initialize weights
        sample_weights = np.ones(len(df))
        anomaly_scores = np.zeros(len(df))
        
        # Boosting iterations
        for iteration in range(n_iterations):
            # Train isolation forest
            iso_forest = IsolationForest(
                contamination=contamination,
                n_estimators=100,
                random_state=42 + iteration
            )
            
            # Fit model with sample weights
            iso_forest.fit(df[features], sample_weight=sample_weights)
            
            # Get predictions
            iteration_scores = iso_forest.score_samples(df[features])
            
            # Update anomaly scores
            anomaly_scores += learning_rate * iteration_scores
            
            # Update sample weights
            sample_weights *= np.exp(-learning_rate * iteration_scores)
            sample_weights /= np.sum(sample_weights)
        
        # Final anomaly detection
        df['anomaly_score'] = anomaly_scores
        df['is_anomaly'] = anomaly_scores < np.percentile(anomaly_scores, contamination * 100)
        
        # Store results
        anomalies[coin] = df[df['is_anomaly']]
        
        # Calculate feature importance
        feature_importance[coin] = pd.Series(
            np.abs(np.corrcoef(df[features].values.T, df['anomaly_score'].values)[:-1, -1]),
            index=features
        )
        
        # Visualization
        plt.figure(figsize=(15, 7))
        plt.plot(df.index, df['price'], label='Price', alpha=0.7)
        plt.scatter(anomalies[coin].index, 
                   anomalies[coin]['price'],
                   color='red',
                   label='Anomalies')
        plt.title(f'Boosted Isolation Forest - {coin.capitalize()}')
        plt.xlabel('Date')
        plt.ylabel('Price')
        plt.legend()
        plt.show()
        
    
    
    return anomalies, feature_importance

# Use the boosted isolation forest
boosted_anomalies, feature_importance = boosted_isolation_forest(processed_data)

# Execute the anomaly detection and save data
isolation_forest_anomalies = isolation_forest_anomaly_detection(processed_data)

# Plot anomalies and save data to CSV
plot_anomalies(processed_data, isolation_forest_anomalies)
save_data_to_csv(processed_data)
