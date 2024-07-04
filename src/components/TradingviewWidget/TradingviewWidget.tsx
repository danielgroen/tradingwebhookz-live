import { useState, useEffect, useRef } from 'react';
import { widget, type ChartingLibraryWidgetOptions as WidgetOptions } from 'charting_library';
import datafeed from './api-pyth/datafeed';
import { ApiState, GlobalState } from '@states/index';

import { useTradingViewWidgetHooks } from './TradingviewWidget.hook';

export const TradingviewWidget = () => {
  const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
  const buttonLongRef = useRef<HTMLButtonElement | null>(null);
  const buttonTradingPanelRef = useRef<HTMLButtonElement | null>(null);
  const buttonShortRef = useRef<HTMLButtonElement | null>(null);

  const [chartWidget, setChartWidget] = useState<any>(null);
  const { tradingPair } = ApiState();
  const { isLoggedIn, toggleSidebar } = GlobalState();

  const { onSymbolChange, onDraw } = useTradingViewWidgetHooks(chartWidget, setChartWidget, chartContainerRef);

  useEffect(() => {
    const widgetOptions: WidgetOptions = {
      symbol: tradingPair,
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
      favorites: { intervals: ['1', '2', '5', '15', '30', '1H', '4H', '1D', '1W'] as any },
      drawings_access: { type: 'black', tools: [{ name: 'Long Position' }, { name: 'Short Position' }] },
      enabled_features: ['chart_property_page_trading', 'show_exchange_logos', 'show_symbol_logos'],
      disabled_features: ['header_quick_search', 'header_saveload', 'popup_hints', 'header_indicators'],
      theme: 'Dark' as WidgetOptions['theme'],
    };

    const chartWidgetInstance = new widget(widgetOptions);

    chartWidgetInstance.onChartReady(() => {
      chartWidgetInstance.headerReady().then(() => {
        setChartWidget(chartWidgetInstance);
      });

      chartWidgetInstance.subscribe('drawing_event', (drawingId, eventName) => {
        onDraw(drawingId, eventName, chartWidgetInstance);
      });

      chartWidgetInstance.subscribe('drawing', (drawingId) => {
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
      if (!buttonTradingPanelRef.current) {
        const buttonTradingPanel = chartWidget.createButton();
        buttonTradingPanel.setAttribute('title', 'Click to activate the Long Position tool');
        buttonTradingPanel.innerHTML = '⚙️ Trading panel';
        buttonTradingPanel.style.color = '#2962ff';
        buttonTradingPanel.classList.add('apply-common-tooltip', 'tv-header-toolbar__button');
        buttonTradingPanel.addEventListener('click', () => {
          toggleSidebar();

          if (buttonTradingPanel.style.color === '') buttonTradingPanel.style.color = '#2962ff';
          else buttonTradingPanel.style.color = '';
        });
        buttonTradingPanelRef.current = buttonTradingPanel;
      }

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
