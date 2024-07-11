import { useEffect, useRef, useState } from 'react';
import { IChartingLibraryWidget } from 'charting_library';
import { GlobalState, OrderState, ApiState, SettingsState } from '@states/index';
import { SIDE } from '@constants/index';
import { Bybit, stepSizeToFixed } from '@utils/index';

export const useTradingViewWidgetHooks = (chartWidget: any) => {
  const { isLoggedIn } = GlobalState();
  const {
    setStopLoss,
    setTakeProfit,
    setPrice,
    setRiskReward,
    side,
    price,
    takeProfit,
    stopLoss,
    openOrders,
    openPositions,
  } = OrderState();
  const { autoRemoveDrawings } = SettingsState();
  const { ...apiStateProps } = ApiState();
  const [currentDrawingId, setCurrentDrawingId] = useState<string | null>(null);
  const [openOrderLines, setOpenOrderLines] = useState([]);
  const orderLinesRef = useRef({});
  const positionLinesRef = useRef({});

  const isLoggedInRef = useRef(isLoggedIn);
  const apiStatePropsRef = useRef(apiStateProps);

  const canFindShape = (id: string) => {
    if (!chartWidget.current) return;
    const getAllDrawings = chartWidget.current?.chart().getAllShapes();
    return getAllDrawings.some((drawing) => drawing.id === id);
  };

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

  // override the price of the drawing
  useEffect(() => {
    // override the stop loss and take profit of the drawing
    try {
      if (!chartWidget.current || !currentDrawingId) return;
      if (!canFindShape(currentDrawingId)) return;
      const drawing = chartWidget.current?.chart()?.getShapeById(currentDrawingId);

      const drawingPrice = drawing?.getPoints()[0].price;

      if (drawingPrice !== Number(price)) {
        const drawingPoints = drawing.getPoints();

        drawing.setPoints([
          { ...drawingPoints[0], price: Number(price) },
          { ...drawingPoints[1], price: Number(price) },
        ]);
        return;
      }

      const tickSize = 0.00000001; // TODO:: FIXME
      const tickerSizeStep = stepSizeToFixed(tickSize);
      const drawProps = drawing.getProperties();

      if (!drawProps.profitLevel || !drawProps.stopLevel) return;
      const { profitLevel, stopLevel } = drawProps;
      let stopLossPrice;
      let takeProfitPrice;
      if (side === SIDE.BUY) {
        stopLossPrice = Number(price) - stopLevel * tickSize;
        takeProfitPrice = Number(price) + profitLevel * tickSize;
      } else if (side === SIDE.SELL) {
        stopLossPrice = Number(price) + stopLevel * tickSize;
        takeProfitPrice = Number(price) - profitLevel * tickSize;
      }
      stopLossPrice = parseFloat(stopLossPrice?.toFixed(tickerSizeStep));
      takeProfitPrice = parseFloat(takeProfitPrice?.toFixed(tickerSizeStep));
      if (!stopLossPrice || !takeProfitPrice) return;

      if (stopLossPrice !== parseFloat(Number(stopLoss).toFixed(tickerSizeStep))) {
        const stopLossToTicks = Math.abs(Number(price) - Number(stopLoss)) / tickSize;
        drawing.setProperties({ stopLevel: stopLossToTicks });
      } else if (takeProfitPrice !== parseFloat(Number(takeProfit).toFixed(tickerSizeStep))) {
        const takeProfitToTicks = Math.abs(Number(price) - Number(takeProfit)) / tickSize;
        drawing.setProperties({ profitLevel: takeProfitToTicks });
      }
    } catch {}
  }, [takeProfit, stopLoss, side, price]);

  // Draw order lines
  useEffect(() => {
    (async () => {
      try {
        if (!chartWidget.current) return;

        const orderIdsToRemove = openOrderLines.filter(
          (openOrder) => !openOrders.some((order) => order.id === openOrder.id)
        );

        orderIdsToRemove.forEach(({ id }) => {
          const lineToRemove = Object.values(orderLinesRef.current).find((openOrder) => openOrder.id === id);
          if (lineToRemove && lineToRemove.line && lineToRemove.line._line && lineToRemove.line._line._id) {
            chartWidget.current.chart().removeEntity(lineToRemove.line._line._id);
            delete orderLinesRef.current[lineToRemove.line._line._id];
          }
        });

        setOpenOrderLines((prev) =>
          prev.filter((openOrder) => !orderIdsToRemove.some((order) => order.id === openOrder.id))
        );

        if (!openOrders.length) return;

        // Draw new order lines
        for (let i = 0; i < openOrders.length; i++) {
          const order = openOrders[i];
          const isAlreadyDrawn = Object.values(orderLinesRef.current).some((openOrder) => openOrder.id === order.id);

          if (isAlreadyDrawn) {
          } else {
            let color = '#4094e8';
            let textPrefix = `${order?.info?.orderType} order`;

            if (order.reduceOnly) {
              if (order?.takeProfitPrice) {
                color = '#66bb6a';
                textPrefix = 'Take Profit';
              } else if (order?.stopPrice || order?.stopPrice) {
                color = '#f44336';
                textPrefix = 'Stop Loss';
              }
            }

            const orderLine = chartWidget.current
              .activeChart()
              .createOrderLine()
              .setBodyTextColor(color)
              .setBodyBorderColor(color)
              .setCancelButtonBorderColor(color)
              .setCancelButtonIconColor(color)
              .setQuantityBackgroundColor(color)
              .setQuantityBorderColor(color)
              .setCancelButtonBackgroundColor('#000')
              .setBodyBackgroundColor('#000')
              .setLineColor(color)
              .setPrice(order.price)
              .onCancel('onCancel called', function () {
                // this.remove();
                Bybit.cancelOrder(apiStateProps, order);
              })
              .setQuantity(order.amount)
              .setText(`${textPrefix}: ${order.price}`);

            if (orderLine && orderLine._line && orderLine._line._id) {
              const orderLineId = orderLine._line._id;
              orderLinesRef.current[orderLineId] = { ...order, line: orderLine };
              setOpenOrderLines((prev) => [...prev, { id: order.id, lineId: orderLineId }]);
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    })();
  }, [openOrders, chartWidget.current]);

  // Draw position lines
  useEffect(() => {
    (async () => {
      try {
        if (!chartWidget.current) return;

        // Remove position lines that are no longer open
        const positionIdsToRemove = Object.keys(positionLinesRef.current).filter(
          (id) => !openPositions.some((position) => position.id === id)
        );

        positionIdsToRemove.forEach((id) => {
          const lineToRemove = positionLinesRef.current[id];
          if (lineToRemove && lineToRemove.line && lineToRemove.line._line && lineToRemove.line._line._id) {
            chartWidget.current.chart().removeEntity(lineToRemove.line._line._id);
            delete positionLinesRef.current[id];
          }
        });

        if (!openPositions.length) return;

        // Draw new position lines
        for (let i = 0; i < openPositions.length; i++) {
          const position = openPositions[i];
          const isAlreadyDrawn = positionLinesRef.current[position.id];

          if (isAlreadyDrawn) {
            continue;
          }

          let color = '#ffab00';

          const positionLine = chartWidget.current
            .activeChart()
            .createOrderLine()
            .setBodyTextColor(color)
            .setBodyBorderColor(color)
            .setCancelButtonBorderColor(color)
            .setCancelButtonIconColor(color)
            .setQuantityBackgroundColor(color)
            .setQuantityBorderColor(color)
            .setQuantityTextColor('#000')
            .setCancelButtonBackgroundColor('#000')
            .setBodyBackgroundColor('#000')
            .setLineColor(color)
            .setPrice(position.entryPrice)
            .setQuantity(position?.info?.unrealisedPnl)
            .setText(`PNL`);

          if (positionLine && positionLine._line && positionLine._line._id) {
            const positionLineId = positionLine._line._id;
            positionLinesRef.current[positionLineId] = { ...position, line: positionLine };
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    })();
  }, [openPositions, chartWidget.current]);

  // TODO:: draw history arrows: bought, sold etc
  // chartWidget.current
  //   .activeChart()
  //   .createExecutionShape()
  //   .setText('@1,320.75 Limit Buy 1')
  //   .setTooltip('@1,320.75 Limit Buy 1')
  //   .setTextColor('rgba(0,255,0,0.5)')
  //   .setArrowColor('#0F0')
  //   .setDirection('buy')
  //   .setTime(chartWidget.current.activeChart().getVisibleRange().from)
  //   .setPrice(160);

  const onDraw = async (drawingId: string, eventName: any) => {
    try {
      setCurrentDrawingId(drawingId);
      if (!canFindShape(drawingId)) return;
      const drawing = chartWidget.current.chart()?.getShapeById(drawingId);

      const toolName = drawing?._source?.toolname;

      if (toolName === 'LineToolRiskRewardShort' || toolName === 'LineToolRiskRewardLong') {
        setTimeout(() => {
          const curDrawingPoints = drawing.getPoints();
          if (!curDrawingPoints.length) return;

          const priceEntry = +curDrawingPoints[0].price;
          const priceTakeProfit = parseFloat(drawing?._source?._profitPriceAxisView?._axisRendererData?.text);
          const priceStopLoss = parseFloat(drawing?._source?._stopPriceAxisView?._axisRendererData?.text);
          const computedRR = (Math.abs(priceEntry - priceTakeProfit) / Math.abs(priceEntry - priceStopLoss)).toFixed(2);
          const getAllDrawings = chartWidget.current.chart().getAllShapes();

          const result = getAllDrawings
            .filter(({ name }) => name === 'long_position' || name === 'short_position')
            .map((drawing) => drawing.id);

          result.pop();

          if (autoRemoveDrawingsRef.current) {
            [...result].forEach((id) => chartWidget.current?.chart()?.removeEntity(id));
          }

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
    if (autoRemoveDrawingsRef.current) chartWidget.current?.chart()?.removeAllShapes();
  }, [side]);

  return {
    onSymbolChange,
    onDraw,
  };
};
