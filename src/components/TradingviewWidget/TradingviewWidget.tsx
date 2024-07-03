import { useState, useEffect, useRef } from 'react';
import {
  widget,
  type ChartingLibraryWidgetOptions as WidgetOptions,
  type IChartingLibraryWidget,
} from 'charting_library';
import { enqueueSnackbar } from 'notistack';
import { GlobalState, OrderState, ApiState, AuthState } from '@states/index';
// import datafeed from './cryptocompare/datafeed';
import datafeed from './api-pyth/datafeed';

export const TradingviewWidget = () => {
  const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
  const { isLoggedIn, toggleSidebar } = GlobalState();
  const { brokerInstance } = AuthState();
  const { setStopLoss, setTakeProfit, setPrice, setRiskReward, side } = OrderState();
  const { setApiLeverage, setApiMinOrderSize, setTradingPair, tradingPair, tradingPairFormatted } = ApiState();

  const [chartWidget, setChartWidget] = useState<any>(null);
  const buttonLongRef = useRef<HTMLButtonElement | null>(null);
  const buttonTradingPanelRef = useRef<HTMLButtonElement | null>(null);
  const buttonShortRef = useRef<HTMLButtonElement | null>(null);

  const setMetaParams = async (name) => {
    if (!isLoggedIn) return;
    setTradingPair(name);

    // Set leverage & minimum contracts
    try {
      const result = await brokerInstance?.fetchLeverage(tradingPairFormatted());
      const { leverage: ApiLeverage, contracts: minimumContracts } = result?.info;

      setApiLeverage(ApiLeverage);
      setApiMinOrderSize(minimumContracts);
    } catch (error) {
      enqueueSnackbar(`${error}`, {
        variant: 'error',
        autoHideDuration: 2000,
      });
    }
  };

  useEffect(() => {
    setMetaParams(tradingPair);
  }, [isLoggedIn]);

  useEffect(() => {
    if (side) return;
    // remove all drawings
    chartWidget?.chart().removeAllShapes();
  }, [side]);

  const handleDrawingEvent = async (drawingId: string, eventName: any, chartWidget: IChartingLibraryWidget) => {
    try {
      const drawing = chartWidget.chart()?.getShapeById(drawingId);
      const toolName = drawing?._source?.toolname;

      if (toolName === 'LineToolRiskRewardShort' || toolName === 'LineToolRiskRewardLong') {
        setTimeout(() => {
          const curDrawingPoints = drawing.getPoints();

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
      // debug: true,
      drawings_access: { type: 'black', tools: [{ name: 'Long Position' }, { name: 'Short Position' }] },
      enabled_features: ['chart_property_page_trading', 'show_exchange_logos', 'show_symbol_logos'],
      disabled_features: [
        // 'items_favoriting',
        'header_quick_search',
        'header_saveload',
        'popup_hints',
        'header_indicators',
      ],
      theme: 'Dark' as WidgetOptions['theme'],
    };

    const chartWidgetInstance = new widget(widgetOptions);

    chartWidgetInstance.onChartReady(() => {
      chartWidgetInstance.headerReady().then(() => {
        setChartWidget(chartWidgetInstance);
      });

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
          setMetaParams(name);
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

  return <div ref={chartContainerRef} style={{ height: '100vh', width: '100%' }} />;
};
