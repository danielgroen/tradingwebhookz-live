import { FC, useEffect, useState } from 'react';
import { Typography, ButtonGroup, Button, Box, type BoxProps, Dialog, DialogTitle, DialogActions } from '@mui/material';
import { Bybit } from '@utils/Bybit.utils';
import { ApiState, OrderState } from '@src/states';
interface Props extends BoxProps {}

export const OrderFormOrders: FC<Props> = ({ ...restBoxProps }) => {
  const { ...apiStateProps } = ApiState();
  const { openOrders, openPositions, ...orderStateProps } = OrderState();
  const [isFormOpen, setIsFormOpen] = useState(0);

  const [modalActions, setModalActions] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const handleOpenModal = (order: any, type: 'cancel' | 'close') => {
    setModalActions({ type, order });
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setModalActions(null);
  };

  const handleActionModal = () => {
    if (!modalActions) return;

    if (modalActions.type === 'cancel') {
      Bybit.cancelOrder(apiStateProps, modalActions.order);
    } else if (modalActions.type === 'close') {
      Bybit.closeCurrentPosition(apiStateProps, modalActions.order);
    }

    handleCloseModal();
  };

  const fetchOrders = () => {
    Bybit.getOpenOrders(apiStateProps, orderStateProps);
    Bybit.getPositions(apiStateProps, orderStateProps);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {modalActions && (
        <Dialog open={open} onClose={handleCloseModal}>
          <DialogTitle>Do you really want to {modalActions.type} this order?</DialogTitle>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button color="error" onClick={handleActionModal} autoFocus>
              {modalActions.type} order
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <Box {...restBoxProps}>
        <ButtonGroup variant="text" size="small">
          <Button onClick={() => setIsFormOpen(0)} variant={isFormOpen === 0 ? 'outlined' : 'text'} key="open">
            Positions
          </Button>
          <Button onClick={() => setIsFormOpen(1)} variant={isFormOpen === 1 ? 'outlined' : 'text'} key="Position">
            Open
          </Button>
        </ButtonGroup>

        {/*
         * active orders
         *
         */}
        {isFormOpen === 0 && (
          <Box className="flex items-center flex-col bg-slate-900 w-full rounded-md min-h-36 max-h-36 p-3 text-sky-900 overflow-x-auto relative">
            {/* filter on this symbol */}
            {!!openPositions.length &&
              openPositions
                .filter(
                  (order) => order.info.symbol === apiStateProps.tradingPairFormatted() && !!Number(order.info.size)
                )
                .map((order, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      gap: 2,
                      alignItems: 'center',
                      '*': { fontSize: '11px !important' },
                      mb: 2,
                      width: '100%',
                      color: 'white',
                      borderLeft: `3px solid ${order.side === 'buy' ? '#66bb6a' : '#f44336'}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ ml: 1 }}>{order.info.symbol}</Typography>
                      <Typography sx={{ ml: 1 }}>{order.contracts}</Typography>
                    </Box>
                    <Typography sx={{ ml: 1 }} fontSize={14}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        {!order.triggerPrice && (
                          <>
                            <Typography sx={{ ml: 1, color: '#00b0ff' }}>Limit order</Typography>
                            <Typography sx={{ ml: 1, color: order.unrealizedPnl > 0 ? '#66bb6a' : '#f44336' }}>
                              {order?.unrealizedPnl?.toLocaleString('en-US')}
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Typography>
                    <Button sx={{ marginLeft: 'auto' }} onClick={() => handleOpenModal(order, 'close')}>
                      Close
                    </Button>
                  </Box>
                ))}
          </Box>
        )}

        {/*
         * Open orders
         *
         */}
        {isFormOpen === 1 && (
          <Box className="flex items-center flex-col bg-slate-900 w-full rounded-md min-h-36 max-h-36 p-3 text-sky-900 overflow-x-auto relative">
            {/* filter on this symbol */}
            {!!openOrders.length &&
              openOrders
                .filter((order) => order.info.symbol === apiStateProps.tradingPairFormatted())
                .map((order) => (
                  <Box
                    key={order.id}
                    sx={{
                      display: 'flex',
                      gap: 2,
                      alignItems: 'center',
                      '*': { fontSize: '11px !important' },
                      mb: 2,
                      width: '100%',
                      color: 'white',
                      borderLeft: `3px solid ${order.side === 'buy' ? '#66bb6a' : '#f44336'}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ ml: 1 }}>{order.info.symbol}</Typography>
                      <Typography sx={{ ml: 1 }}>{order.amount}</Typography>
                    </Box>
                    <Typography sx={{ ml: 1 }} fontSize={14}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        {!order.triggerPrice && (
                          <>
                            <Typography sx={{ ml: 1, color: '#00b0ff' }}>Limit order</Typography>
                            <Typography sx={{ ml: 1 }}>{order.takeProfitPrice.toLocaleString('en-US')}</Typography>
                          </>
                        )}
                        {order.triggerPrice && order.takeProfitPrice && (
                          <>
                            <Typography sx={{ ml: 1, color: '#66bb6a' }}>TP</Typography>
                            <Typography sx={{ ml: 1 }}>{order.takeProfitPrice.toLocaleString('en-US')}</Typography>
                          </>
                        )}
                        {order.triggerPrice && order.stopLossPrice && (
                          <>
                            <Typography sx={{ ml: 1, color: '#f44336' }}>SL</Typography>
                            <Typography sx={{ ml: 1 }}>{order.stopLossPrice.toLocaleString('en-US')}</Typography>
                          </>
                        )}
                      </Box>
                    </Typography>
                    <Button sx={{ marginLeft: 'auto' }} onClick={() => handleOpenModal(order, 'cancel')}>
                      Cancel
                    </Button>
                  </Box>
                ))}
          </Box>
        )}
      </Box>
    </>
  );
};
