"use client";

import { useEffect, useRef, useState } from "react";

const TradingViewWidget = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetRef = useRef<any>(null);
  const [symbol, setSymbol] = useState<string>("BITSTAMP:BTCUSD");

  useEffect(() => {
    if (typeof window === "undefined") return; // Ensure SSR safety

    // Ensure TradingView script loads only once
    if (!document.getElementById("tradingview-script")) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.id = "tradingview-script";
      script.async = true;
      script.onload = () => initTradingView();
      document.body.appendChild(script);
    } else {
      initTradingView();
    }

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
    };
  }, [symbol]);

  const initTradingView = () => {
    if (!window.TradingView || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight || 750; // Default height if undefined

    const widget = new window.TradingView.widget({
      container_id: containerRef.current.id,
      symbol: symbol,
      interval: "D",
      theme: "dark",
      style: "1",
      width: containerWidth,
      height: containerHeight,
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      hide_side_toolbar: false,
      details: true,
      studies: ["STD;Moving Average"],
      timezone: "Etc/UTC",
      toolbar_bg: "#f1f3f6",
    });

    widgetRef.current = widget;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100vw", height: "100vh" }}>
      <div
        id="tradingview_chart"
        ref={containerRef}
        style={{
          width: "90vw", // Adjust width to fit the screen
          height: "80vh", // Keep a proportional height
          maxWidth: "1200px",
          maxHeight: "750px",
          border: "1px solid #ccc",
        }}
      />
    </div>
  );
};

export default TradingViewWidget;
