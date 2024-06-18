import { Chip, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { FaGear } from 'react-icons/fa6';
import { IoClose, IoLogOutOutline, IoChevronBack } from 'react-icons/io5';
import { SiMicrosoftexcel } from 'react-icons/si';
import { BrokerState, GlobalState, SettingsState } from '@states/index';

export const Header = () => {
  const { apiKey, isTestnet } = BrokerState();
  const { orderbook } = SettingsState();
  const { isLoggedIn, isSettingsOpen, setIsSettingsOpen, setShowSidebar, setIsLoggedIn } = GlobalState();

  const { setBrokerInstance, setApiKey, setSecret, clearStore } = BrokerState();

  const handleLogout = () => {
    clearStore();
    setIsSettingsOpen(false);
    setIsLoggedIn(false);
    setBrokerInstance(null);
    setApiKey('');
    setSecret('');
    enqueueSnackbar('Logged out', {
      variant: 'success',
    });
  };

  return (
    <>
      <div
        className="flex items-center justify-between mb-4 pb-4 gap-1"
        style={{ borderBottom: '1px solid rgba(43, 58, 96, 0.54)' }}
      >
        {isLoggedIn ? (
          <>
            <Chip
              sx={{ mr: 'auto' }}
              label={`${isTestnet ? '🚧' : '🟢'} ${apiKey.substring(0, 4)}*******${apiKey.substring(11)}`}
            />
            {!isSettingsOpen ? (
              <FaGear style={{ cursor: 'pointer' }} size={18} onClick={() => setIsSettingsOpen(true)} />
            ) : (
              <IoChevronBack style={{ cursor: 'pointer' }} size={24} onClick={() => setIsSettingsOpen(false)} />
            )}
          </>
        ) : (
          <Typography variant="h6" className="block">
            Log in
          </Typography>
        )}
        <IoClose style={{ cursor: 'pointer', marginLeft: 12 }} size={24} onClick={() => setShowSidebar(false)} />
      </div>
      {isLoggedIn && (
        <div className="flex items-center justify-end mb-0 gap-3">
          {isSettingsOpen ? (
            <IoLogOutOutline
              style={{
                cursor: 'pointer',
                color: 'red',
              }}
              size={24}
              opacity={0.9}
              onClick={handleLogout}
            />
          ) : (
            <>
              {orderbook && (
                <SiMicrosoftexcel
                  onClick={() => {
                    window.open(`https://${orderbook}`, '_blank');
                  }}
                  style={{ cursor: 'pointer' }}
                  size={24}
                />
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};
