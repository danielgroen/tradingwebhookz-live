import { enqueueSnackbar } from 'notistack';
import { type SIDE } from '@constants/index';

// https://docs.ccxt.com/#/exchanges/bybit
export class Bybit {
  /*
   * @function SetStateLeverage
   * Update the state of the app with the leverage for the current trading pair
   */
  static SetStateLeverage = async (apiState) => {
    const { setApiLeverage, tradingPairFormatted, brokerInstance } = apiState;

    try {
      const result = await brokerInstance?.fetchLeverage(tradingPairFormatted());
      const { leverage: ApiLeverage } = result?.info;
      setApiLeverage(ApiLeverage);
    } catch (error) {
      enqueueSnackbar(`[FETCH LEVERAGE]: ${error}`, {
        variant: 'error',
      });
    }
  };

  /*
   * @function SetStateGeneralSymbolInfo
   * Update the state of the app with general information for the current trading pair
   */
  static SetStateGeneralSymbolInfo = async (apiState) => {
    const { setApiLeverageMax, setApiLeverageStepSize, setApiMinOrderSize, setApiMaxOrderSize, tradingPairFormatted } =
      apiState;
    try {
      const result = await fetch(
        `https://api.bybit.com/v5/market/instruments-info?category=linear&symbol=${tradingPairFormatted()}`
      )
        .then((res) => res.json())
        .then((data) => data?.result?.list[0]);

      setApiMaxOrderSize(result.lotSizeFilter.maxOrderQty);
      setApiMinOrderSize(result.lotSizeFilter.minOrderQty);

      setApiLeverageMax(result.leverageFilter.maxLeverage);
      setApiLeverageStepSize(result.leverageFilter.leverageStep);
    } catch (error) {
      enqueueSnackbar(`[SET SYMBOL INFO]: ${error}`, {
        variant: 'error',
      });
    }
  };

  /*
   * @function SetStateFees
   * Update the state of the app with the fees for the current trading pair
   */
  static SetStateFees = async (apiState) => {
    const { tradingPair, brokerInstance, setFees } = apiState;

    try {
      const result = await brokerInstance?.fetchTradingFee(tradingPair);
      setFees({ maker: result?.info.makerFeeRate * 100, taker: result?.info.takerFeeRate * 100 });
    } catch (error) {
      enqueueSnackbar(`[SET FEES]: ${error}`, {
        variant: 'error',
      });
    }
  };

  /*
   * @function UpdateApiLeverage
   * Update the API leverage for the current trading pair
   */
  static UpdateApiLeverage = async (newLeverage, apiState) => {
    const { tradingPairFormatted, brokerInstance } = apiState;

    try {
      await brokerInstance?.setLeverage(newLeverage, tradingPairFormatted());

      enqueueSnackbar(`New Leverage set for this pair: ${newLeverage}`, {
        variant: 'info',
        autoHideDuration: 2000,
      });
    } catch (error) {
      console.log(`[UPDATE LEVERAGE]: ${error}`);
      // enqueueSnackbar(`${error}`, {
      //   variant: 'error',
      // });
    }
  };

  /*
   * @function SendOrder
   * Send an order to the broker via the API
   */
  static SendOrder = async (orderstateProps, apiState, settingsState) => {
    const { side, qty, price, stopLoss, takeProfit, changeWatchOrderSubmit } = orderstateProps;
    const { tradingPairFormatted, brokerInstance } = apiState;
    const { orderTypeStoploss, orderTypeTakeProfit } = settingsState;

    try {
      await brokerInstance?.createOrder(
        tradingPairFormatted(),
        'limit', // base order is always limit
        side as SIDE,
        qty,
        parseFloat(price),
        {
          // 0 for one-way mode, 1 buy side of hedged mode, 2 sell side of hedged mode
          positionIdx: 0,
          stopLoss: {
            type: orderTypeStoploss,
            price: parseFloat(stopLoss),
            triggerPrice: parseFloat(stopLoss),
          },
          takeProfit: {
            type: orderTypeTakeProfit,
            price: parseFloat(takeProfit),
            triggerPrice: parseFloat(takeProfit),
          },
        }
      );

      changeWatchOrderSubmit(false);

      enqueueSnackbar(`New order placed!`, {
        variant: 'success',
        autoHideDuration: 2000,
      });
    } catch (error) {
      enqueueSnackbar(`[SEND ORDER]: ${error}`, {
        variant: 'error',
        autoHideDuration: 6000,
      });
      console.log(error);
    }
  };

  /*
   * @function getBalance
   * Get the account balance for the current asset
   */
  static getBalance = async (apiState, setAccountBalance) => {
    const { counterAsset, brokerInstance } = apiState;
    try {
      const getBalance = await brokerInstance?.fetchBalance();

      setAccountBalance(getBalance[counterAsset]?.free);
    } catch (error) {
      enqueueSnackbar(`[GET BALANCE]: ${error}`, {
        variant: 'error',
      });
    }
  };

  /*
   * @function getOpenOrders
   * Get the open orders for the current trading pair
   */
  static getOpenOrders = async (apiState, orderStateProps) => {
    const { setOpenOrders } = orderStateProps;
    const { tradingPairFormatted, brokerInstance } = apiState;
    try {
      const openOrders = await brokerInstance?.fetchOpenOrders(tradingPairFormatted());
      setOpenOrders(openOrders);
    } catch (error) {
      enqueueSnackbar(`[GET OPEN ORDERS]: ${error}`, {
        variant: 'error',
      });
    }
  };

  /*
   * @function cancelOrder
   * Cancel an order for the current trading pair
   */
  static cancelOrder = async (apiState, order) => {
    const { brokerInstance } = apiState;
    try {
      brokerInstance.cancelOrder(order.id, order.info.symbol);
      enqueueSnackbar(`Cancelled order`, {
        variant: 'success',
        autoHideDuration: 2000,
      });
    } catch (error) {
      enqueueSnackbar(`[CANCEL ORDER]: ${error}`, {
        variant: 'error',
      });
    }
  };

  /*
   * @function getPositions
   * Get the open positions for the current trading pair
   */
  static getPositions = async (apiState, orderStateProps) => {
    const { setOpenPositions } = orderStateProps;
    const { tradingPairFormatted, brokerInstance } = apiState;
    try {
      const openOrders = await brokerInstance?.fetchPositions([tradingPairFormatted()]);
      setOpenPositions(openOrders);
    } catch (error) {
      enqueueSnackbar(`[GET POSITION]: ${error}`, {
        variant: 'error',
      });
    }
  };

  static closeCurrentPosition = async (apiState, order) => {
    const { tradingPairFormatted, brokerInstance } = apiState;
    try {
      await brokerInstance?.createOrder(
        tradingPairFormatted(),
        'market',
        ['long', 'buy'].includes(order.side) ? 'sell' : ('buy' as SIDE),
        order.contracts
      );

      enqueueSnackbar(`Closed order`, {
        variant: 'success',
        autoHideDuration: 2000,
      });
    } catch (error) {
      enqueueSnackbar(`[CLOSE POSITION]: ${error}`, {
        variant: 'error',
      });
    }
  };
}
