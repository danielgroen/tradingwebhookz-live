import { type FC } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { ApiState } from '@states/index';

export const InfoDialog: FC<any> = ({ open, setOpen }) => {
  const {
    apiLeverage,
    apiLeverageMax,
    apiMaxOrderSize,
    apiLeverageStepSize,
    tradingPairFormatted,
    apiMinOrderSize,
    fees,
  } = ApiState();

  return (
    <Dialog
      open={open}
      fullWidth
      onClose={() => {
        setOpen(false);
      }}
    >
      <DialogTitle>Symbol info: {tradingPairFormatted()}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <br />
          Minimal order size: {apiMinOrderSize}
          <br />
          Maximal order size: {apiMaxOrderSize}
          <br />
          leverage current: {apiLeverage}
          <br />
          leverage maximal: {apiLeverageMax}
          <br />
          leverage stepsize: {apiLeverageStepSize}
          <br />
          <br />
          Maker Fees: {fees.maker}
          <br />
          Taker Fees: {fees.taker}
          <br />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setOpen(false);
          }}
        >
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
};
