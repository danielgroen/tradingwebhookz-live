import { useState, useEffect, useRef } from 'react';
import { widget, type ChartingLibraryWidgetOptions as WidgetOptions } from 'charting_library';
// import datafeed from './api-bybit/datafeed';
import datafeed, { supported_resolutions } from './api-cryptocompare/datafeed';
import { ApiState, GlobalState } from '@states/index';
import { useTradingViewWidgetHooks } from './TradingviewWidget.hook';

export const TradingviewWidget = () => {
  const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
  const buttonLongRef = useRef<HTMLButtonElement | null>(null);
  const buttonShortRef = useRef<HTMLButtonElement | null>(null);

  const [chartWidget, setChartWidget] = useState<any>(null);
  const chartWidgetRef = useRef<any>(null);

  const [drawingId, setDrawingId] = useState<string | null>(null);
  const drawingIdRef = useRef<string | null>(null);

  const { tradingPair } = ApiState();
  const { isLoggedIn } = GlobalState();

  const { onSymbolChange, onDraw } = useTradingViewWidgetHooks(chartWidgetRef, drawingIdRef);

  useEffect(() => {
    drawingIdRef.current = drawingId;
  }, [drawingId]);

  useEffect(() => {
    chartWidgetRef.current = chartWidget;
  }, [chartWidget]);

  useEffect(() => {
    let currentUrl = window.location.href;
    let url = new URL(currentUrl);
    const symbol = url.searchParams.get('symbol');

    const widgetOptions: WidgetOptions = {
      symbol: `bybit:${symbol ? symbol : tradingPair}`,
      datafeed,
      locale: 'en',
      interval: '1' as WidgetOptions['interval'],
      container: chartContainerRef.current,
      library_path: '/charting_library/',
      charts_storage_url: 'https://saveload.tradingview.com',
      charts_storage_api_version: '1.1',
      client_id: location?.host,
      user_id: 'tradingmaestro12',
      autosize: true,
      studies_overrides: {},
      favorites: { intervals: supported_resolutions as any },
      drawings_access: { type: 'black', tools: [{ name: 'Long Position' }, { name: 'Short Position' }] },
      enabled_features: ['chart_property_page_trading', 'show_exchange_logos', 'show_symbol_logos'],
      disabled_features: ['header_quick_search', 'header_saveload', 'popup_hints', 'header_indicators'],
      overrides: {
        'paneProperties.vertGridProperties.color': 'transparent',
        'paneProperties.horzGridProperties.color': 'transparent',
      },
      theme: 'Dark' as WidgetOptions['theme'],
    };

    const chartWidgetInstance = new widget(widgetOptions);

    chartWidgetInstance.onChartReady(() => {
      chartWidgetInstance.applyOverrides({
        'paneProperties.vertGridProperties.color': 'transparent',
        'paneProperties.horzGridProperties.color': 'transparent',
      });
      chartWidgetInstance.headerReady().then(() => {
        setChartWidget(chartWidgetInstance);
      });

      chartWidgetInstance.subscribe('drawing_event', (drawingId, eventName) => {
        if (eventName === 'create') {
          setDrawingId(drawingId);
        } else if (eventName === 'remove') {
          // console.log('remove');
          // setDrawingId(null);
        }
        onDraw(eventName);
      });

      chartWidgetInstance.subscribe('drawing', (event) => {
        if (buttonLongRef.current) buttonLongRef.current.style.color = 'inherit';
        if (buttonShortRef.current) buttonShortRef.current.style.color = 'inherit';
      });

      chartWidgetInstance
        .activeChart()
        .onSymbolChanged()
        .subscribe(null, ({ name }) => {
          onSymbolChange(name);
        });
    });

    return () => {
      chartWidgetInstance.remove();
    };
  }, []);

  useEffect(() => {
    if (chartWidget) {
      if (isLoggedIn) {
        if (!buttonLongRef.current) {
          const buttonLong = chartWidget.createButton();
          buttonLong.setAttribute('title', 'Click to activate the Long Position tool');
          buttonLong.innerHTML = '🌲 Long';
          buttonLongRef.current = buttonLong;
          buttonLong.addEventListener('click', () => {
            chartWidget.selectLineTool('long_position');
            buttonLong.style.color = '#2962ff';
            buttonLong.style.display = 'block !important';
          });

          const buttonShort = chartWidget.createButton();
          buttonShort.setAttribute('title', 'Click to activate the Short Position tool');
          buttonShort.innerHTML = '🔻 Short';
          buttonShortRef.current = buttonShort;
          buttonShort.addEventListener('click', () => {
            chartWidget.selectLineTool('short_position');
            buttonShort.style.color = '#2962ff';
            buttonShort.style.display = 'block !important';
          });
        } else if (buttonLongRef.current && buttonShortRef.current) {
          (buttonLongRef.current as any).parentNode.parentNode.style.display = 'block';
          (buttonLongRef.current as any).parentNode.parentNode.previousSibling.style.display = 'flex';

          (buttonShortRef.current as any).parentNode.parentNode.style.display = 'block';
          (buttonShortRef.current as any).parentNode.parentNode.previousSibling.style.display = 'flex';
        }
      } else {
        if (buttonLongRef.current) {
          (buttonLongRef.current as any).parentNode.parentNode.style.display = 'none';
          (buttonLongRef.current as any).parentNode.parentNode.previousSibling.style.display = 'none';
        }
        if (buttonShortRef.current) {
          (buttonShortRef.current as any).parentNode.parentNode.style.display = 'none';
          (buttonShortRef.current as any).parentNode.parentNode.previousSibling.style.display = 'none';
        }
      }
    }
  }, [chartWidget, isLoggedIn]);

  return <div ref={chartContainerRef} style={{ height: '100vh', width: '100%' }} />;
};
