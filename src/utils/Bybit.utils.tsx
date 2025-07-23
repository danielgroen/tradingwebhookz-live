import { enqueueSnackbar } from 'notistack';
import { SIDE, CATEGORY, ORDER_TYPE } from '@constants/index';

// https://docs.ccxt.com/#/exchanges/bybit
export class Bybit {
  /*
   * @function SetStateLeverage
   * Update the state of the app with the leverage for the current trading pair
   * https://docs.ccxt.com/#/exchanges/bybit?id=fetchleverage
   */
  static SetStateLeverage = async (apiState) => {
    const { setApiLeverage, tradingPairFormatted, brokerInstance } = apiState;

    try {
      const result = await brokerInstance?.fetchLeverage(tradingPairFormatted());
      const { leverage: ApiLeverage } = result?.info;
      setApiLeverage(ApiLeverage);
    } catch ({ message }: any) {
      enqueueSnackbar(`[FETCH LEVERAGE]: ${message}`, {
        variant: 'error',
      });
    }
  };

  /*
   * @function SetStateGeneralSymbolInfo
   * Update the state of the app with general information for the current trading pair
   */
  static SetStateGeneralSymbolInfo = async (apiState, category) => {
    const { setApiLeverageMax, setApiLeverageStepSize, setApiMinOrderSize, setApiMaxOrderSize, tradingPairFormatted } =
      apiState;

    // TODO:: FIX HARDCODED CATEGORY
    try {
      const result = await fetch(
        `https://api.bybit.com/v5/market/instruments-info?category=${category}&symbol=${tradingPairFormatted()}`
      )
        .then((res) => res.json())
        .then((data) => data?.result?.list[0]);

      setApiMaxOrderSize(result.lotSizeFilter.maxOrderQty);
      setApiMinOrderSize(result.lotSizeFilter.minOrderQty);

      setApiLeverageMax(result.leverageFilter.maxLeverage);
      setApiLeverageStepSize(result.leverageFilter.leverageStep);
    } catch ({ message }: any) {
      enqueueSnackbar(`[SET SYMBOL INFO]: ${message}`, {
        variant: 'error',
      });
    }
  };

  /*
   * @function SetStateFees
   * Update the state of the app with the fees for the current trading pair
   * https://docs.ccxt.com/#/exchanges/bybit?id=fetchtradingfee
   */
  static SetStateFees = async (apiState) => {
    const { tradingPairFormatted, brokerInstance, setFees } = apiState;

    try {
      const [enableUnifiedMargin, enableUnifiedAccount] = await brokerInstance.isUnifiedEnabled();
      if (enableUnifiedAccount) {
        setFees({ maker: 0.02, taker: 0.055 }); // TODO:: get unified fees.. BUT HOW??
      } else {
        const result = await brokerInstance?.fetchTradingFee(tradingPairFormatted());
        setFees({ maker: result?.info.makerFeeRate * 100, taker: result?.info.takerFeeRate * 100 });
      }
    } catch ({ message }: any) {
      enqueueSnackbar(`[SET FEES]: ${message}`, {
        variant: 'error',
      });
    }
  };

  /*
   * @function UpdateApiLeverage
   * Update the API leverage for the current trading pair
   * https://docs.ccxt.com/#/exchanges/bybit?id=setleverage
   */
  static UpdateApiLeverage = async (newLeverage, apiState) => {
    const { tradingPairFormatted, brokerInstance } = apiState;

    try {
      await brokerInstance?.setLeverage(newLeverage, tradingPairFormatted());

      enqueueSnackbar(`New Leverage set for this pair: ${newLeverage}`, {
        variant: 'success',
        autoHideDuration: 2000,
      });
    } catch ({ message }: any) {
      console.log(`[UPDATE LEVERAGE]: ${message}`);
      // enqueueSnackbar(`${message}`, {
      //   variant: 'error',
      // });
    }
  };

  /*
   * @function SendOrder
   * Send an order to the broker via the API
   * https://docs.ccxt.com/#/exchanges/bybit?id=createorder
   */
  static SendOrder = async (orderstateProps, apiState, settingsState, cb) => {
    const { side, qty, price, stopLoss, takeProfit, setSubmittedOrderId } = orderstateProps;
    const { tradingPairFormatted, brokerInstance } = apiState;
    const { orderTypeStoploss, orderTypeTakeProfit, category } = settingsState;

    try {
      await brokerInstance.setPositionMode(true);
      const order = await brokerInstance?.createOrder(
        tradingPairFormatted(),
        'limit', // base order is always limit
        side as SIDE,
        category === CATEGORY.LINEAR ? qty : qty * price,
        parseFloat(price),
        {
          postOnly: true,
          hedged: false, // enforce one-way mode
          // 0 for one-way mode, 1 buy side of hedged mode, 2 sell side of hedged mode
          // positionIdx: side === SIDE.BUY ? 1 : 2,
          stopLoss: {
            // type: orderTypeStoploss,
            ...(orderTypeStoploss === ORDER_TYPE.LIMIT && { price: parseFloat(stopLoss) }),
            triggerPrice: parseFloat(stopLoss),
          },
          takeProfit: {
            // type: orderTypeTakeProfit,
            ...(orderTypeTakeProfit === ORDER_TYPE.LIMIT && { price: parseFloat(takeProfit) }),
            triggerPrice: parseFloat(takeProfit),
          },
        }
      );
      setSubmittedOrderId(order.id);
    } catch ({ message }: any) {
      enqueueSnackbar(`[SEND ORDER]: ${message}`, {
        variant: 'error',
        autoHideDuration: 6000,
      });
      cb();
    }
  };

  /*
   * @function getBalance
   * Get the account balance for the current asset
   * https://docs.ccxt.com/#/exchanges/bybit?id=fetchbalance
   */
  static getBalance = async (apiState, setAccountBalance) => {
    const { counterAsset, brokerInstance } = apiState;
    try {
      const getBalance = await brokerInstance?.fetchBalance();
      setAccountBalance(getBalance[counterAsset]);
    } catch ({ message }: any) {
      enqueueSnackbar(`[GET BALANCE]: ${message}`, {
        variant: 'error',
        autoHideDuration: 6000,
      });
    }
  };

  /*
   * @function getOpenOrders
   * Get the open orders for the current trading pair
   * https://docs.ccxt.com/#/exchanges/bybit?id=fetchopenorders
   */
  static getOpenOrders = async (apiState, orderStateProps) => {
    const { setOpenOrders, openOrders: oldOpenOrders } = orderStateProps;
    const { tradingPairFormatted, brokerInstance } = apiState;
    try {
      // const openOrders = await brokerInstance?.fetchOpenOrders(tradingPairFormatted());
      const openOrders = await brokerInstance?.fetchOpenOrders();
      // if (oldOpenOrders?.length !== openOrders?.length)
      setOpenOrders(openOrders);
    } catch ({ message }: any) {
      enqueueSnackbar(`[GET OPEN ORDERS]: ${message}`, {
        autoHideDuration: 6000,
        variant: 'error',
      });
    }
  };

  /*
   * @function cancelOrder
   * Cancel an order for the current trading pair
   * https://docs.ccxt.com/#/exchanges/bybit?id=cancelorder
   */
  static cancelOrder = async (apiState, order) => {
    const { brokerInstance } = apiState;
    try {
      brokerInstance.cancelOrder(order.id, order.info.symbol);
      enqueueSnackbar('Cancelled order', {
        variant: 'success',
        autoHideDuration: 2000,
      });
    } catch ({ message }: any) {
      enqueueSnackbar(`[CANCEL ORDER]: ${message}`, {
        autoHideDuration: 6000,
        variant: 'error',
      });
    }
  };

  /*
   * @function editOrder
   * Cancel an order for the current trading pair
   * https://docs.ccxt.com/#/exchanges/bybit?id=editorder
   */
  static editOrder = async (apiState, position, newPrice) => {
    const { brokerInstance } = apiState;
    const price = position.reduceOnly ? undefined : newPrice;

    try {
      brokerInstance.editOrder(position.id, position.symbol, position.type, position.side, position.amount, price, {
        ...(position.takeProfitPrice && { takeProfitPrice: newPrice }),
        ...(position.stopLossPrice && { stopLossPrice: newPrice }),
        // stopPrice: newPrice,
        // stopLossPrice: newPrice,
        // ...(position.stopPrice && { stopPrice: newPrice }),
        // ...(position.triggerPrice && { triggerPrice: newPrice }),
        // ...(position.entryPrice && { entryPrice: newPrice }),
      });
      enqueueSnackbar('Editted order', {
        variant: 'success',
        autoHideDuration: 2000,
      });
    } catch ({ message }: any) {
      enqueueSnackbar(`[EDIT ORDER]: ${message}`, {
        autoHideDuration: 6000,
        variant: 'error',
      });
    }
  };

  /*
   * @function getPositions
   * Get the open positions for the current trading pair
   * https://docs.ccxt.com/#/exchanges/bybit?id=fetchpositions
   */
  static getPositions = async (apiState, orderStateProps) => {
    const { setOpenPositions } = orderStateProps;
    const { tradingPairFormatted, brokerInstance } = apiState;

    try {
      const openOrders = await brokerInstance?.fetchPositions([tradingPairFormatted()]);
      setOpenPositions(openOrders?.filter((order) => !!order.side));
    } catch ({ message }: any) {
      enqueueSnackbar(`[GET POSITION]: ${message}`, {
        autoHideDuration: 6000,
        variant: 'error',
      });
    }
  };
  /*
   * @function closeCurrentPosition
   * Close the current position for the current trading pair
   * https://docs.ccxt.com/#/exchanges/bybit?id=createorder
   */
  static closeCurrentPosition = async (apiState, order) => {
    const { tradingPairFormatted, brokerInstance } = apiState;
    try {
      await brokerInstance.setPositionMode(true);
      await brokerInstance?.createOrder(
        tradingPairFormatted(),
        'market',
        ['long', 'buy'].includes(order.side) ? 'sell' : ('buy' as SIDE),
        order.contracts,
        undefined,
        {
          positionIdx: order?.side === SIDE.BUY ? 2 : 1,
        }
      );

      enqueueSnackbar(`Closed order`, {
        variant: 'success',
        autoHideDuration: 2000,
      });
    } catch ({ message }: any) {
      enqueueSnackbar(`[CLOSE POSITION]: ${message}`, {
        variant: 'error',
        autoHideDuration: 6000,
      });
    }
  };
}
