import { FC, useEffect, useState } from 'react';
import {
  Typography,
  ButtonGroup,
  Button,
  Box,
  type BoxProps,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Bybit } from '@utils/Bybit.utils';
import { ApiState, OrderState } from '@src/states';
interface Props extends BoxProps {}

export const OrderFormOrders: FC<Props> = ({ ...restBoxProps }) => {
  const { ...apiStateProps } = ApiState();
  const { openOrders, ...orderStateProps } = OrderState();
  const [isFormOpen, setIsFormOpen] = useState(0);
  const [openOrderToClose, setOpenOrderToClose] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const fetchOpenOrders = () => {
    Bybit.getOpenOrders(apiStateProps, orderStateProps);
  };

  useEffect(() => {
    fetchOpenOrders();
    const interval = setInterval(fetchOpenOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box {...restBoxProps}>
      <ButtonGroup variant="text" size="small">
        <Button onClick={() => setIsFormOpen(0)} variant={isFormOpen === 0 ? 'outlined' : 'text'} key="open">
          Active
        </Button>
        <Button onClick={() => setIsFormOpen(1)} variant={isFormOpen === 1 ? 'outlined' : 'text'} key="Position">
          Open
        </Button>
      </ButtonGroup>

      <Dialog open={open} onClose={() => {}} title="hoi">
        <DialogTitle>Do you really want to close this order?</DialogTitle>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button color="error" onClick={handleClose} autoFocus>
            Close order
          </Button>
        </DialogActions>
      </Dialog>

      {/* active*/}
      {isFormOpen === 0 && (
        <Box className="flex flex-col bg-slate-900 w-full rounded-md min-h-48 p-4 relative">
          {/* filter on this symbol */}
          {!!openOrders.length ? (
            openOrders
              .filter((order) => order.info.symbol === apiStateProps.tradingPairFormatted())
              .map((order) => (
                <Box
                  key={order.id}
                  sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, borderLeft: '3px solid red' }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', '*': { fontSize: 12 } }}>
                    <Typography sx={{ ml: 1 }}>{order.info.symbol}</Typography>
                    <Typography sx={{ ml: 1 }}>{order.amount}</Typography>
                  </Box>
                  <Typography sx={{ ml: 1 }} fontSize={14}>
                    {order.price}
                  </Typography>
                  <Button sx={{ marginLeft: 'auto' }} onClick={() => handleClickOpen()}>
                    Close
                  </Button>
                </Box>
              ))
          ) : (
            <Typography className="self-center text-sky-900" sx={{ mt: '25%' }}>
              No active orders...
            </Typography>
          )}
        </Box>
      )}

      {/* Open */}
      {isFormOpen === 1 && (
        <Box className="flex items-center flex-col justify-center bg-slate-900 w-full rounded-md min-h-48 p-4 text-sky-900 relative">
          Work in progress.
        </Box>
      )}
    </Box>
  );
};
