import { Typography, TextField } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { SettingsState } from '@states/index';

export const SettingsForm = () => {
  const { risk, setRisk, collateral, setCollateral, orderbook, setOrderbook } = SettingsState();

  return (
    <>
      <div>
        <Typography variant="h6" sx={{ mb: 2 }} className="block">
          Settings
        </Typography>
        <TextField
          value={risk}
          onChange={(e) => setRisk(e.target.value)}
          onClick={(e) => e.target?.select()}
          size="small"
          sx={{ mb: 2, pr: 1, width: '50%' }}
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          InputProps={{ endAdornment: '%' }}
          label="Max risk"
        />
        <TextField
          value={collateral}
          onChange={(e) => setCollateral(e.target.value)}
          size="small"
          sx={{ mb: 2, pl: 0.5, width: '50%' }}
          label="Collateral"
          disabled
        />
        <TextField value="0.02%" disabled size="small" sx={{ mb: 2, pr: 1, width: '50%' }} label="Fees" />
        <TextField
          value={orderbook}
          onChange={(e) => setOrderbook(e.target.value)}
          onBlur={(e) => {
            enqueueSnackbar(`Saved in your local storage`, {
              variant: 'info',
              autoHideDuration: 2000,
            });
          }}
          size="small"
          // sx={{ mb: 2, pl: 0.5, width: '50%' }}
          label="Link to your orderbook"
          InputProps={{ startAdornment: 'https://' }}
        />
      </div>
    </>
  );
};
