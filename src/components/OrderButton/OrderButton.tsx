import { type FC } from 'react';
import { Button } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { AuthState, OrderState, ApiState, SettingsState } from '@states/index';

export const OrderButton: FC = () => {
  const { brokerInstance } = AuthState();
  const { stopLoss, takeProfit, price, side, qty, localLeverage } = OrderState();
  const { apiLeverage, setApiLeverage } = ApiState();
  const { orderTypeStoploss, orderTypeTakeProfit } = SettingsState();
  const { getPrimaryPair } = ApiState();

  const handlePlaceOrder = async () => {
    if (!side || !getPrimaryPair() || !qty || !price || !stopLoss || !takeProfit || !localLeverage) {
      alert('Fill all fields');
      return;
    }

    // Set leverage
    try {
      if (apiLeverage !== +localLeverage) {
        await brokerInstance?.setLeverage(parseFloat(localLeverage), getPrimaryPair());
        enqueueSnackbar(`New Leverage: ${localLeverage}`, {
          variant: 'info',
          autoHideDuration: 2000,
        });
        setApiLeverage(+localLeverage);
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
        'limit', // base order is always limit
        side,
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
