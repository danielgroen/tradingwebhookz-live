import { type FC } from 'react';
import { Button } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { BrokerState, OrderState, MarketState } from '@states/index';

export const OrderButton: FC = () => {
  const { brokerInstance } = BrokerState();
  const { stopLoss, takeProfit, price, side, qty, leverage } = OrderState();
  const { getPrimaryPair } = MarketState();

  const handlePlaceOrder = async () => {
    if (!side || !getPrimaryPair() || !qty || !price || !stopLoss || !takeProfit || !leverage) {
      alert('Fill all fields');
      return;
    }

    // Set leverage
    try {
      const result = await brokerInstance?.fetchLeverage(getPrimaryPair());
      const { leverage: ApiLeverage, contracts: minimumContracts } = result?.info;

      if (ApiLeverage !== +leverage) {
        await brokerInstance?.setLeverage(parseFloat(leverage), getPrimaryPair());
        enqueueSnackbar(`New Leverage: ${leverage}`, {
          variant: 'info',
          autoHideDuration: 2000,
        });
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar(`${error}`, {
        variant: 'error',
      });
    }

    // Place order
    try {
      const placeOrder = await brokerInstance?.createOrder(
        getPrimaryPair(),
        'limit',
        side,
        parseFloat(qty) / parseFloat(price),
        parseFloat(price),
        {
          marketUnit: 'quoteCoin',
          stopLoss: {
            type: 'limit',
            price: parseFloat(stopLoss),
            triggerPrice: parseFloat(stopLoss),
          },
          takeProfit: {
            type: 'limit',
            price: parseFloat(takeProfit),
            triggerPrice: parseFloat(takeProfit),
          },
        }
      );
      enqueueSnackbar(`New order placed: `, {
        variant: 'success',
        autoHideDuration: 2000,
      });
      console.log(placeOrder);
    } catch (error) {
      enqueueSnackbar(`${error}`, {
        variant: 'error',
        autoHideDuration: 6000,
      });
      console.log(error);
    }
  };

  return (
    <Button onClick={handlePlaceOrder} variant="outlined" fullWidth>
      Place order
    </Button>
  );
};
