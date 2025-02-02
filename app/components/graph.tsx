import React, { useEffect, useRef } from "react";

const TradingViewWidget = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      new window.TradingView.widget({
        container_id: "tradingview_chart",
        symbol: "BITSTAMP:BTCUSD",
        interval: "D",
        theme: "dark",
        style: "1",
        width: "1200",
        height: "750",
        locale: "en",
        enable_publishing: false,
        allow_symbol_change: true,
        studies: ["STD;Moving Average"], // Adds a simple MA as a guide
        timezone: "Etc/UTC",
      });
    };

    containerRef.current.appendChild(script);
  }, []);

  return <div id="tradingview_chart" ref={containerRef} />;
};

export default TradingViewWidget;
