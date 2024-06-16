import { useEffect, useRef, useState } from 'react';
import './TradingviewWidget.css';
import { widget, type ChartingLibraryWidgetOptions as WidgetOptions } from 'charting_library';
import Data from './Data';

export const TradingviewWidget = () => {
  const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
  const [datafeed, setDatafeed] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          'https://api.bybit.com/v5/market/kline?category=linear&symbol=BTCUSDT&interval=60&start=1670601600000&end=1670608800000'
        );
        const data = await response.json();

        const formattedData =
          data?.result?.list?.map((d) => ({
            // time: +d[0] / 1000,
            time: +d[0],
            low: parseFloat(d[3]),
            high: parseFloat(d[2]),
            open: parseFloat(d[1]),
            close: parseFloat(d[4]),
            volume: +d[5],
          })) || [];

        setDatafeed(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    })();
  }, []);

  useEffect(() => {
    if (!datafeed?.length) return;
    console.log(datafeed);

    const widgetOptions: WidgetOptions = {
      symbol: 'BTCUSDT',

      // BEWARE: no trailing slash is expected in feed URL
      // datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(datafeed),
      // datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(datafeed),
      datafeed: new Data(datafeed),
      locale: 'en',
      interval: '60' as WidgetOptions['interval'],
      container: chartContainerRef.current,
      library_path: '/charting_library/',
      disabled_features: ['use_localstorage_for_settings'],
      charts_storage_url: 'https://saveload.tradingview.com',
      charts_storage_api_version: '1.1',
      client_id: location?.host,
      user_id: 'tradingmaestro12',
      autosize: true,
      studies_overrides: {},
      debug: true,
      // enabled_features: ['chart_property_page_trading', 'trading_template', 'trading_hotkeys_feature'],
      enabled_features: ['chart_property_page_trading', 'show_exchange_logos', 'show_symbol_logos'],
      theme: 'Dark' as WidgetOptions['theme'],
      overrides: {
        'trading.paneProperties.legend.trades': true,
      },
    };

    //  https://docs.ccxt.com/#/exchanges/bybit?id=watchorderbook

    const chartWidget = new widget(widgetOptions);

    chartWidget.onChartReady(() => {
      // this places arrows over the chart, so you can see where the buy/sell signals are
      // chartWidget.activeChart().createExecutionShape().setDirection("buy").setTime(chartWidget.activeChart().getVisibleRange().to).setPrice(160);

      chartWidget.headerReady().then(() => {
        const button = chartWidget.createButton();
        button.setAttribute('title', 'Click to activate the Long Position tool');
        button.classList.add('apply-common-tooltip', 'tv-header-toolbar__button', 'tv-header-toolbar__button--active');
        button.addEventListener('click', () => {
          // chartWidget.chart().createPositionLine()
          // .onModify(function() {
          //     this.setText("onModify called");
          // })
          // .onReverse("onReverse called", function(text) {
          //     this.setText(text);
          // })
          // .onClose("onClose called", function(text) {
          //     this.setText(text);
          // })
          // .setText("PROFIT: 71.1 (3.31%)")
          // .setTooltip("Additional position information")
          // .setProtectTooltip("Protect position")
          // .setCloseTooltip("Close position")
          // .setReverseTooltip("Reverse position")
          // .setQuantity("8.235")
          // .setPrice(160)
          // .setExtendLeft(true)
          // .setLineStyle(0)
          // .setLineLength(25);
          // chartWidget.chart().executeActionById('showSymbolInfoDialog');
        });
        button.innerHTML = 'Long Position';
      });
    });

    return () => {
      chartWidget.remove();
    };
  }, [datafeed]);

  return <div ref={chartContainerRef} className="TVChartContainer" />;
};
