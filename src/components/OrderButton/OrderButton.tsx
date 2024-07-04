import { type FC } from 'react';
import { Button } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { OrderState, ApiState, SettingsState } from '@states/index';
import { Bybit } from '@utils/index';

export const OrderButton: FC = () => {
  const { apiLeverage, setApiLeverage, brokerInstance } = ApiState();
  const { isOrderFilled, localLeverage, clearOrder, ...orderstateProps } = OrderState();
  const { orderTypeStoploss, orderTypeTakeProfit } = SettingsState();
  const { primaryPair, tradingPairFormatted } = ApiState();

  const handlePlaceOrder = async () => {
    // Set leverage
    try {
      if (apiLeverage !== +localLeverage) {
        await Bybit.UpdateApiLeverage(parseFloat(localLeverage), { tradingPairFormatted, brokerInstance });

        setApiLeverage(+localLeverage);
        clearOrder();
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar(`${error}`, {
        variant: 'error',
      });
    }

    Bybit.SendOrder(
      orderstateProps,
      { tradingPairFormatted, brokerInstance },
      { orderTypeStoploss, orderTypeTakeProfit }
    );
  };

  return (
    <Button onClick={handlePlaceOrder} disabled={!isOrderFilled()} variant="outlined" fullWidth>
      Place order
    </Button>
  );
};
