import { enqueueSnackbar } from 'notistack';
import { type SIDE } from '@constants/index';

// https://docs.ccxt.com/#/exchanges/bybit
export class Bybit {
  /*
   * @function SetStateLeverage
   * Update the state of the app with the leverage for the current trading pair
   */
  static SetStateLeverage = async (apiState) => {
    const {
      setApiLeverage,
      setApiLeverageMax,
      setApiLeverageStepSize,
      setApiMinOrderSize,
      setApiMaxOrderSize,
      tradingPairFormatted,
      brokerInstance,
    } = apiState;

    try {
      const result = await brokerInstance?.fetchLeverage(tradingPairFormatted());
      const { leverage: ApiLeverage } = result?.info;

      setApiLeverage(ApiLeverage);
    } catch (error) {
      enqueueSnackbar(`${error}`, {
        variant: 'error',
      });
    }

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
      enqueueSnackbar(`${error}`, {
        variant: 'error',
      });
    }
  };

  /*
   * @function SetStateFees
   * Update the state of the app with the fees for the current trading pair
   */
  static SetStateFees = async (apiState) => {
    const { tradingPair, brokerInstance } = apiState;

    try {
      const result = await brokerInstance?.fetchTradingFee(tradingPair);

      apiState.setFees({ maker: result?.info.makerFeeRate * 100, taker: result?.info.takerFeeRate * 100 });
    } catch (error) {
      enqueueSnackbar(`${error}`, {
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
    console.log(tradingPairFormatted, tradingPairFormatted());

    try {
      await brokerInstance?.setLeverage(newLeverage, tradingPairFormatted());

      enqueueSnackbar(`New Leverage set for this pair: ${newLeverage}`, {
        variant: 'info',
        autoHideDuration: 2000,
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar(`${error}`, {
        variant: 'error',
      });
    }
  };

  /*
   * @function SendOrder
   * Send an order to the broker via the API
   */
  static SendOrder = async (orderstateProps, apiState, settingsState) => {
    const { side, qty, price, stopLoss, takeProfit } = orderstateProps;
    const { tradingPairFormatted, brokerInstance } = apiState;
    const { orderTypeStoploss, orderTypeTakeProfit } = settingsState;

    console.log(tradingPairFormatted(), parseFloat(qty) / parseFloat(price));

    try {
      await brokerInstance?.createOrder(
        tradingPairFormatted(),
        'limit', // base order is always limit
        side as SIDE,
        parseFloat(qty) / parseFloat(price),
        parseFloat(price),
        {
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
      enqueueSnackbar(`New order placed: `, {
        variant: 'success',
        autoHideDuration: 2000,
      });
    } catch (error) {
      enqueueSnackbar(`${error}`, {
        variant: 'error',
        autoHideDuration: 6000,
      });
      console.log(error);
    }
  };

  static getBalance = async (apiState, setAccountBalance) => {
    const { counterAsset, brokerInstance } = apiState;
    try {
      const getBalance = await brokerInstance?.fetchBalance();

      setAccountBalance(getBalance[counterAsset]?.free);
    } catch (error) {
      enqueueSnackbar(`${error}`, {
        variant: 'error',
      });
    }
  };
}
