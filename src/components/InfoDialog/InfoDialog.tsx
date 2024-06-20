import { type FC } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

export const InfoDialog: FC<any> = ({ open, setOpen }) => {
  return (
    <Dialog
      open={open}
      fullWidth
      onClose={() => {
        setOpen(false);
      }}
    >
      <DialogTitle>Symbol info</DialogTitle>
      <DialogContent>
        <DialogContentText>
          minimal contracts: ...
          <br />
          current leverage: ...
          <br />
          maximal leverage: ...
          <br />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setOpen(false);
          }}
        >
          Ok!
        </Button>
      </DialogActions>
    </Dialog>
  );
};
