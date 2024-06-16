import { TextField, Typography, Button } from '@mui/material';
// import { FaGear } from 'react-icons/fa6';
// import { IoClose } from 'react-icons/io5';
// import { BybitState, GlobalState } from '@states/index';

export const OrderForm = () => {
  // const { isLoggedIn, apiKey, isTestnet } = BybitState();
  // const { isSettingsOpen, setIsSettingsOpen } = GlobalState();

  return (
    <>
      <div>
        <Typography variant="h6" sx={{ mb: 2 }} className="block">
          Place order
        </Typography>
        <TextField fullWidth size="small" sx={{ mb: 2 }} label="Amount" InputProps={{ endAdornment: 'contracts' }} />
        <TextField fullWidth size="small" sx={{ mb: 2 }} label="Symbol" />
        <TextField fullWidth size="small" sx={{ mb: 2 }} label="Price" InputProps={{ endAdornment: '$' }} />
        <TextField disabled focused fullWidth size="small" sx={{ mb: 2 }} label="Leverage" />
        <TextField color="error" fullWidth focused size="small" sx={{ mb: 2, pr: 0.5, width: '50%' }} label="SL" />
        <TextField fullWidth color="success" focused size="small" sx={{ mb: 2, pl: 0.5, width: '50%' }} label="TP" />
      </div>
      <div style={{ marginBottom: 8, marginTop: 'auto' }}>
        {/* <div>Balance: $ {(+balance)?.toFixed(2)}</div> */}
        <div>PNL of current trade: $ 0.00</div>
      </div>
      <Button variant="outlined" fullWidth>
        Place order
      </Button>
    </>
  );
};
