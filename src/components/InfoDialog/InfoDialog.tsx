import { type FC } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { ApiState } from '@states/index';

export const InfoDialog: FC<any> = ({ open, setOpen }) => {
  const { getApiLeverage, getApiLeverageMax, getTradingPairFormatted, apiMinOrderSize } = ApiState();

  return (
    <Dialog
      open={open}
      fullWidth
      onClose={() => {
        setOpen(false);
      }}
    >
      <DialogTitle>Symbol info: {getTradingPairFormatted()}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <br />
          minimal contracts: {apiMinOrderSize}
          <br />
          current leverage: {getApiLeverage()}
          <br />
          maximal leverage: {getApiLeverageMax()}
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
