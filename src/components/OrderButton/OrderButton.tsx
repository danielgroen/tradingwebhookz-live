import { type FC } from 'react';
import { Button } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { AuthState, OrderState, ApiState, SettingsState } from '@states/index';

export const OrderButton: FC = () => {
  const { brokerInstance } = AuthState();
  const { apiLeverage, setApiLeverage } = ApiState();
  const { isOrderFilled, stopLoss, takeProfit, price, side, qty, localLeverage, clearOrder } = OrderState();
  const { orderTypeStoploss, orderTypeTakeProfit } = SettingsState();
  const { primaryPair } = ApiState();

  const handlePlaceOrder = async () => {
    // Set leverage
    try {
      if (apiLeverage !== +localLeverage) {
        await brokerInstance?.setLeverage(parseFloat(localLeverage), primaryPair);
        enqueueSnackbar(`New Leverage: ${localLeverage}`, {
          variant: 'info',
          autoHideDuration: 2000,
        });
        setApiLeverage(+localLeverage);
        clearOrder();
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
        primaryPair,
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
    <Button onClick={handlePlaceOrder} disabled={!isOrderFilled()} variant="outlined" fullWidth>
      Place order
    </Button>
  );
};
