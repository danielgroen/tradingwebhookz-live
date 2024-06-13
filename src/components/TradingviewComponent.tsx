// https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/
import { useEffect, useRef, memo } from 'react';

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
        {
          "autosize": true,
          "symbol": "BINANCE:BTCUSDT",
          "interval": "5",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "gridColor": "rgba(240, 243, 250, 0)",
          "backgroundColor": "rgba(2, 6, 23, .5)",
          "hide_top_toolbar": false,
          "withdateranges": false,
          "hide_side_toolbar": false,
          "allow_symbol_change": true,
          "calendar": false,
          "hide_volume": true,
          "support_host": "https://www.tradingview.com"
        }`;
    container.current?.appendChild(script);
  }, []);

  return (
    <div
      style={{
        height: '100vh',
        width: 'calc(100vw - 400px)',
        minHeight: '100vh',
        overflow: 'hidden',
        opacity: 0.8,
      }}
    >
      <div
        className="tradingview-widget-container"
        ref={container}
        style={{ height: '100vh', width: 'calc(100vw - 400px)', minHeight: '100vh' }}
      >
        <div
          className="tradingview-widget-container__widget"
          style={{
            height: 'calc(100vh - 32px)',
            width: 'calc(100vw - 400px)',
            minHeight: '100vh !important',
          }}
        ></div>

        <div className="tradingview-widget-copyright">
          <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
            <span className="blue-text">Track all markets on TradingView</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export const TradingviewComponent = memo(TradingViewWidget);
