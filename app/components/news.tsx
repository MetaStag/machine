import React, { useEffect, useRef, memo } from "react";

function NewsWidget() {
  const container = useRef();

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
        {
  "feedMode": "all_symbols",
  "isTransparent": false,
  "displayMode": "regular",
  "width": 1200,
  "height": 700,
  "colorTheme": "dark",
  "locale": "en"
}`;
    container.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright">
      </div>
    </div>
  );
}

export default memo(NewsWidget);