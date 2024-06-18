import { useState, useEffect, useRef } from 'react';
import './TradingviewWidget.css';
import { widget, type ChartingLibraryWidgetOptions as WidgetOptions } from 'charting_library';
import { GlobalState, OrderState, SettingsState } from '@states/index';
import Datafeed from './Datafeed';

export const TradingviewWidget = () => {
  const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
  const { isLoggedIn, toggleSidebar } = GlobalState();
  const { setCollateral } = SettingsState();
  const { setStopLoss, setSymbol, setTakeProfit, setPrice, setRiskReward } = OrderState();
  const [chartWidget, setChartWidget] = useState<any>(null);
  const buttonLongRef = useRef<HTMLButtonElement | null>(null);
  const buttonTradingPanelRef = useRef<HTMLButtonElement | null>(null);
  const buttonShortRef = useRef<HTMLButtonElement | null>(null);

  const handleDrawingEvent = async (drawingId: string, eventName: any, chartWidget: any) => {
    try {
      const drawing = chartWidget.chart()?.getShapeById(drawingId);
      const toolName = drawing?._source?.toolname;

      if (toolName === 'LineToolRiskRewardShort' || toolName === 'LineToolRiskRewardLong') {
        setTimeout(() => {
          const curDrawingPoints = drawing.getPoints();
          // const props = drawing.getProperties();

          const priceEntry = +curDrawingPoints[0].price;
          const priceTakeProfit = parseFloat(drawing?._source?._profitPriceAxisView?._axisRendererData?.text);
          const priceStopLoss = parseFloat(drawing?._source?._stopPriceAxisView?._axisRendererData?.text);
          const computedRR = (Math.abs(priceEntry - priceTakeProfit) / Math.abs(priceEntry - priceStopLoss)).toFixed(2);
          const getAllDrawings = chartWidget.chart().getAllShapes();

          const result = getAllDrawings
            .filter(({ name }) => name === 'long_position' || name === 'short_position')
            .map((drawing) => drawing.id);

          result.pop();

          [...result].forEach((id) => chartWidget.chart().removeEntity(id));

          setRiskReward(`${computedRR}`.replace('.', ':'));
          setPrice(`${priceEntry}`);
          setTakeProfit(`${priceTakeProfit}`);
          setStopLoss(`${priceStopLoss}`);
        }, 0);
      }
    } catch (error) {}
  };

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
      // debug: true,
      drawings_access: { type: 'black', tools: [{ name: 'Long Position' }, { name: 'Short Position' }] },
      enabled_features: ['chart_property_page_trading', 'show_exchange_logos', 'show_symbol_logos'],
      disabled_features: ['items_favoriting', 'header_quick_search', 'header_saveload', 'popup_hints'],
      theme: 'Dark' as WidgetOptions['theme'],
    };

    const chartWidgetInstance = new widget(widgetOptions);

    chartWidgetInstance.onChartReady(() => {
      setChartWidget(chartWidgetInstance);

      chartWidgetInstance.subscribe('drawing_event', (drawingId, eventName) => {
        handleDrawingEvent(drawingId, eventName, chartWidgetInstance);
      });

      chartWidgetInstance.subscribe('drawing', (drawingId) => {
        if (buttonLongRef.current) buttonLongRef.current.style.color = 'inherit';
        if (buttonShortRef.current) buttonShortRef.current.style.color = 'inherit';
      });

      chartWidgetInstance
        .activeChart()
        .onSymbolChanged()
        .subscribe(null, ({ name }) => {
          setSymbol(name);
          setCollateral(name.split('/')[1]);
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

          if (buttonTradingPanel.style.color === '') {
            buttonTradingPanel.style.color = '#2962ff';
          } else {
            buttonTradingPanel.style.color = '';
          }
        });
        buttonTradingPanelRef.current = buttonTradingPanel;
      }

      if (isLoggedIn) {
        if (!buttonLongRef.current) {
          const buttonLong = chartWidget.createButton();
          buttonLong.setAttribute('title', 'Click to activate the Long Position tool');
          buttonLong.innerHTML = '🌲 Long';
          buttonLong.classList.add('apply-common-tooltip', 'tv-header-toolbar__button');
          buttonLong.addEventListener('click', () => {
            chartWidget.selectLineTool('long_position');
            buttonLong.style.color = '#2962ff';
            buttonLong.style.display = 'block !important';
          });
          buttonLongRef.current = buttonLong;

          const buttonShort = chartWidget.createButton();
          buttonShort.setAttribute('title', 'Click to activate the Short Position tool');
          buttonShort.classList.add('apply-common-tooltip', 'tv-header-toolbar__button');
          buttonShort.innerHTML = '🔻 Short';
          buttonShort.addEventListener('click', () => {
            buttonShort.style.color = '#2962ff';
            buttonShort.style.display = 'block !important';

            chartWidget.selectLineTool('short_position');
          });
          buttonShortRef.current = buttonShort;
        } else if (buttonLongRef.current && buttonShortRef.current) {
          // display parent parent node
          buttonLongRef.current.parentNode.parentNode.style.display = 'block';
          buttonLongRef.current.parentNode.parentNode.previousSibling.style.display = 'flex';
          // display parent parent node previous sibling

          buttonShortRef.current.parentNode.parentNode.style.display = 'block';
          buttonShortRef.current.parentNode.parentNode.previousSibling.style.display = 'flex';
        }
      } else {
        if (buttonLongRef.current) {
          buttonLongRef.current.parentNode.parentNode.style.display = 'none';
          buttonLongRef.current.parentNode.parentNode.previousSibling.style.display = 'none';
        }
        if (buttonShortRef.current) {
          buttonShortRef.current.parentNode.parentNode.style.display = 'none';
          buttonShortRef.current.parentNode.parentNode.previousSibling.style.display = 'none';
        }
      }
    }
  }, [chartWidget, isLoggedIn]);

  return <div ref={chartContainerRef} className="TVChartContainer" />;
};
