import { type FC, useEffect, useState, useRef } from 'react';
import { Button } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { OrderState, ApiState, SettingsState } from '@states/index';
import { Bybit } from '@utils/index';

export const OrderButton: FC = () => {
  const { apiLeverage, setApiLeverage, brokerInstance } = ApiState();
  const { isOrderFilled, localLeverage, clearOrder, submittedOrderId, openOrders, ...orderstateProps } = OrderState();
  const { orderTypeStoploss, orderTypeTakeProfit } = SettingsState();
  const { primaryPair, tradingPairFormatted } = ApiState();
  const [isSendingOrder, setIsSendingOrder] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const openOrdersRef = useRef(openOrders);

  useEffect(() => {
    openOrdersRef.current = openOrders;
  }, [openOrders]);

  const canSubmit = () => {
    return isOrderFilled() && !isSendingOrder;
  };

  const handlePlaceOrder = async () => {
    setIsSendingOrder(true);

    try {
      // Set leverage
      if (apiLeverage !== +localLeverage) {
        await Bybit.UpdateApiLeverage(parseFloat(localLeverage), { tradingPairFormatted, brokerInstance });
        setApiLeverage(+localLeverage);
      }
    } catch (error) {
      enqueueSnackbar(`${error}`, {
        variant: 'error',
      });
    }

    Bybit.SendOrder(
      orderstateProps,
      { tradingPairFormatted, brokerInstance },
      { orderTypeStoploss, orderTypeTakeProfit },
      () => {
        setIsSendingOrder(false);
      }
    );
  };

  useEffect(() => {
    (async () => {
      const openOrdersContainsSubmittedOrder = openOrders.some((order) => order.id === submittedOrderId);

      if (submittedOrderId && !openOrdersContainsSubmittedOrder) {
        orderstateProps.setSubmittedOrderId(null);
        await new Promise((resolve) => setTimeout(resolve, 3000));

        if (!openOrdersRef.current.some((order) => order.id === submittedOrderId)) {
          if (retryCount < 3) {
            setRetryCount(retryCount + 1);
            handlePlaceOrder();
            enqueueSnackbar(`Retrying to place an order! Attempt ${retryCount + 1} / 3`, {
              variant: 'warning',
              autoHideDuration: 2000,
            });
          } else {
            enqueueSnackbar(`Failed to place order after 3 attempts!`, {
              variant: 'error',
              autoHideDuration: 5000,
            });
            setIsSendingOrder(false);
            setRetryCount(0);
          }
        } else {
          enqueueSnackbar(`Order successfully created!`, {
            variant: 'success',
            autoHideDuration: 2000,
          });
          setIsSendingOrder(false);
          clearOrder();
          setRetryCount(0);
        }
      } else if (!submittedOrderId || !openOrdersContainsSubmittedOrder) return;
      else {
        orderstateProps.setSubmittedOrderId(null);
        enqueueSnackbar(`Order successfully created!`, {
          variant: 'success',
          autoHideDuration: 2000,
        });
        setIsSendingOrder(false);
        clearOrder();
        setRetryCount(0);
      }
    })();
  }, [submittedOrderId, openOrders]);

  return (
    <Button onClick={handlePlaceOrder} disabled={!canSubmit()} variant="outlined" fullWidth>
      Place order
    </Button>
  );
};
