import { useEffect, useRef } from 'react';
import { IChartingLibraryWidget } from 'charting_library';
import { GlobalState, OrderState, ApiState, SettingsState } from '@states/index';
import { Bybit } from '@utils/index';

export const useTradingViewWidgetHooks = (chartWidget: any, setChartWidget: any, chartContainerRef: any) => {
  const { isLoggedIn } = GlobalState();
  const { setStopLoss, setTakeProfit, setPrice, setRiskReward, side } = OrderState();
  const { autoRemoveDrawings } = SettingsState();
  const { ...apiStateProps } = ApiState();

  const isLoggedInRef = useRef(isLoggedIn);
  const apiStatePropsRef = useRef(apiStateProps);

  useEffect(() => {
    isLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn]);

  useEffect(() => {
    apiStatePropsRef.current = apiStateProps;
  }, [apiStateProps]);

  const onSymbolChange = async (name: string) => {
    if (!isLoggedInRef.current) return;

    await apiStatePropsRef.current.setTradingPair(name);
    await Bybit.SetStateLeverage(apiStatePropsRef.current);
    await Bybit.SetStateGeneralSymbolInfo(apiStatePropsRef.current);
    await Bybit.SetStateFees(apiStatePropsRef.current);
  };

  const autoRemoveDrawingsRef = useRef(autoRemoveDrawings);
  useEffect(() => {
    autoRemoveDrawingsRef.current = autoRemoveDrawings;
  }, [autoRemoveDrawings]);

  const onDraw = async (drawingId: string, eventName: any, chartWidget: IChartingLibraryWidget) => {
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

          if (autoRemoveDrawingsRef.current) [...result].forEach((id) => chartWidget.chart().removeEntity(id));

          setRiskReward(`${computedRR}`.replace('.', ':'));
          setPrice(`${priceEntry}`);
          setTakeProfit(`${priceTakeProfit}`);
          setStopLoss(`${priceStopLoss}`);
        }, 0);
      }
    } catch (error) {
      console.error('Error in onDraw:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      onSymbolChange(apiStateProps.tradingPair);
    }
  }, [isLoggedIn, apiStateProps.tradingPair]);

  useEffect(() => {
    if (side) return;
    chartWidget?.chart().removeAllShapes();
  }, [side]);

  return {
    onSymbolChange,
    onDraw,
  };
};
