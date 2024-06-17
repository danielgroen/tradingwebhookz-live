import { Typography, TextField, Button } from '@mui/material';
import { BrokerState, GlobalState } from '@states/index';

export const SettingsForm = () => {
  const { setBrokerInstance, setApiKey, setSecret } = BrokerState();
  const { setIsLoggedIn, setIsSettingsOpen } = GlobalState();

  const handleLogout = () => {
    setIsSettingsOpen(false);
    setIsLoggedIn(false);
    setBrokerInstance(null);
    setApiKey('2CsRgnKhTpvOuol7EE');
    setSecret('TLAzJpunuJ7QRcyhhdI9xQR7snEI4N4RfR2M');
  };

  return (
    <>
      <div>
        <Typography variant="h6" sx={{ mb: 2 }} className="block">
          Settings
        </Typography>
        <TextField value="1%" size="small" sx={{ mb: 2, pr: 0.5, width: '50%' }} label="risk" />
        <TextField value="0.02%" size="small" sx={{ mb: 2, pl: 0.5, width: '50%' }} label="Fees" />
      </div>
      <Button color="error" onClick={() => handleLogout()} variant="outlined" fullWidth sx={{ mt: 'auto' }}>
        Log out
      </Button>
    </>
  );
};
