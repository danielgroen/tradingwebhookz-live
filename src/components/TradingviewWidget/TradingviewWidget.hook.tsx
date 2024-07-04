import { useEffect } from 'react';
import { IChartingLibraryWidget } from 'charting_library';
import { GlobalState, OrderState, ApiState } from '@states/index';
import { Bybit } from '@utils/index';

// https://docs.ccxt.com/#/exchanges/bybit?id=bybit
export const useTradingViewWidgetHooks = (chartWidget: any, setChartWidget: any, chartContainerRef: any) => {
  const { isLoggedIn } = GlobalState();
  const { setStopLoss, setTakeProfit, setPrice, setRiskReward, side } = OrderState();
  const { ...apiStateProps } = ApiState();
  /*
   * @function onSymbolChange
   * Called when the trading pair changed AND initial load
   */
  const onSymbolChange = async (name: string) => {
    if (!isLoggedIn) return;

    await apiStateProps.setTradingPair(name);

    await Bybit.SetStateLeverage(apiStateProps);
    await Bybit.SetStateGeneralSymbolInfo(apiStateProps);
    await Bybit.SetStateFees(apiStateProps);
  };

  /*
   * @function onDraw
   * Called when a drawing is made on the chart
   */
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
    if (isLoggedIn) {
      onSymbolChange(apiStateProps.tradingPair);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (side) return;
    chartWidget?.chart().removeAllShapes();
  }, [side]);

  return {
    onSymbolChange,
    onDraw,
  };
};
