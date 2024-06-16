import { Typography, TextField } from '@mui/material';
// import { FaGear } from 'react-icons/fa6';
// import { IoClose } from 'react-icons/io5';
// import { BybitState, GlobalState } from '@states/index';

export const SettingsForm = () => {
  // const { isLoggedIn, apiKey, isTestnet } = BybitState();
  // const { isSettingsOpen, setIsSettingsOpen } = GlobalState();

  return (
    <div>
      <Typography variant="h6" sx={{ mb: 2 }} className="block">
        Settings
      </Typography>
      <TextField value="1%" size="small" sx={{ mb: 2, pr: 0.5, width: '50%' }} label="risk" />
      <TextField value="0.02%" size="small" sx={{ mb: 2, pl: 0.5, width: '50%' }} label="Fees" />
    </div>
  );
};
