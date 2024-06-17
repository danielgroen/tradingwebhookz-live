import { useEffect, useRef } from 'react';
import './TradingviewWidget.css';
import { widget, type ChartingLibraryWidgetOptions as WidgetOptions } from 'charting_library';
import { GlobalState, OrderState, BrokerState } from '@states/index';
import Datafeed from './Datafeed';

export const TradingviewWidget = () => {
  const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
  const { isLoggedIn } = GlobalState();
  const { setStopLoss, setTakeProfit, setPrice } = OrderState();
  const { brokerInstance } = BrokerState();

  useEffect(() => {
    const widgetOptions: WidgetOptions = {
      symbol: 'BTC/USDT',
      datafeed: Datafeed,
      locale: 'en',
      interval: 'D' as WidgetOptions['interval'],
      container: chartContainerRef.current,
      library_path: '/charting_library/',
      charts_storage_url: 'https://saveload.tradingview.com',
      charts_storage_api_version: '1.1',
      client_id: location?.host,
      user_id: 'tradingmaestro12',
      autosize: true,
      studies_overrides: {},
      debug: true,
      drawings_access: { type: 'black', tools: [{ name: 'Long Position' }, { name: 'Short Position' }] },
      enabled_features: ['chart_property_page_trading', 'show_exchange_logos', 'show_symbol_logos'],
      disabled_features: ['items_favoriting', 'header_quick_search', 'header_saveload'],
      theme: 'Dark' as WidgetOptions['theme'],
      overrides: {
        // 'trading.paneProperties.legend.trades': true,
      },
    };

    //  https://docs.ccxt.com/#/exchanges/bybit?id=watchorderbook

    const chartWidget = new widget(widgetOptions);

    chartWidget.onChartReady(() => {
      const buttonLong = chartWidget.createButton();
      buttonLong.setAttribute('title', 'Click to activate the Long Position tool');
      buttonLong.innerHTML = '🌲 Long Position';
      buttonLong.classList.add('apply-common-tooltip', 'tv-header-toolbar__button');
      buttonLong.addEventListener('click', () => {
        chartWidget.selectLineTool('long_position');
        buttonLong.style.color = '#2962ff';
      });

      const buttonShort = chartWidget.createButton();
      buttonShort.setAttribute('title', 'Click to activate the Short Position tool');
      buttonShort.classList.add('apply-common-tooltip', 'tv-header-toolbar__button');
      buttonShort.innerHTML = '🔻 Short Position';
      buttonShort.addEventListener('click', () => {
        buttonShort.style.color = '#2962ff';
        chartWidget.selectLineTool('short_position');
      });
    });

    chartWidget.subscribe('drawing_event', async (drawingId) => {
      // if (!isLoggedIn) return;

      const drawing = chartWidget.chart().getShapeById(drawingId);
      const toolName = drawing?._source?.toolname;

      // TODO:: remember drawingID so if we draw a new long/short pos we remove the older one
      // Don't forget to add the watcher in the useEffect array
      // chartWidget.chart().removeEntity(drawingId);

      if (toolName === 'LineToolRiskRewardShort' || toolName === 'LineToolRiskRewardLong') {
        const curDrawingPoints = drawing.getPoints();
        const curPrice = curDrawingPoints[0].price;
        const { profitLevel, stopLevel } = drawing.getProperties();

        console.log(drawing);

        // const getTickSize = await brokerInstance?.fetchTicker('BTC/USDT');
        // console.log(123123123, getTickSize);

        // const realStopLoss = curPrice - tickSize * stopLevel;
        // const realTakeProfit = curPrice + tickSize * profitLevel;

        setPrice(`${curPrice}`);
        // TODO:: change tickers to the price of the current symbol
        setTakeProfit(`${drawing?._source?._profitPriceAxisView?._axisRendererData?.text}`);
        setStopLoss(`${drawing?._source?._stopPriceAxisView?._axisRendererData?.text}`);
      }
    });

    return () => {
      chartWidget.remove();
    };
  }, []);

  return <div ref={chartContainerRef} className="TVChartContainer" />;
};
