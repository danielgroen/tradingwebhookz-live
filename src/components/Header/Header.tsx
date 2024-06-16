import { Chip, Typography } from '@mui/material';
import { FaGear } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';
import { BybitState, GlobalState } from '@states/index';

export const Header = () => {
  const { isLoggedIn, apiKey, isTestnet } = BybitState();
  const { isSettingsOpen, setIsSettingsOpen } = GlobalState();

  return (
    <div className="flex items-center justify-between">
      {isLoggedIn ? (
        <>
          <Chip label={`${isTestnet ? '🚧' : '🟢'} ${apiKey.substring(0, 4)}*******${apiKey.substring(11)}`} />
          {!isSettingsOpen ? (
            <FaGear
              style={{ cursor: 'pointer', marginLeft: 'auto' }}
              size={18}
              onClick={() => setIsSettingsOpen(true)}
            />
          ) : (
            <IoClose style={{ cursor: 'pointer', marginLeft: 16 }} size={24} onClick={() => setIsSettingsOpen(false)} />
          )}
        </>
      ) : (
        <Typography variant="h6" sx={{ mb: 2 }} className="block">
          Log in with your credentials
        </Typography>
      )}
    </div>
  );
};
