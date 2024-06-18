import { Chip, Typography } from '@mui/material';
import { FaGear } from 'react-icons/fa6';
import { IoChevronBack } from 'react-icons/io5';
import { BrokerState, GlobalState } from '@states/index';

export const Header = () => {
  const { apiKey, isTestnet } = BrokerState();
  const { isLoggedIn, isSettingsOpen, setIsSettingsOpen, setIsLoggedIn } = GlobalState();

  const { setBrokerInstance, setApiKey, setSecret } = BrokerState();

  const handleLogout = () => {
    setIsSettingsOpen(false);
    setIsLoggedIn(false);
    setBrokerInstance(null);
    setApiKey('2CsRgnKhTpvOuol7EE');
    setSecret('TLAzJpunuJ7QRcyhhdI9xQR7snEI4N4RfR2M');
  };

  return (
    <div className="flex items-center justify-between mb-6">
      {isLoggedIn ? (
        <>
          <Chip
            label={`${isTestnet ? '🚧' : '🟢'} ${apiKey.substring(0, 4)}*******${apiKey.substring(11)}`}
            onDelete={handleLogout}
          />
          {!isSettingsOpen ? (
            <FaGear
              style={{ cursor: 'pointer', marginLeft: 'auto' }}
              size={18}
              onClick={() => setIsSettingsOpen(true)}
            />
          ) : (
            <IoChevronBack
              style={{ cursor: 'pointer', marginLeft: 'auto' }}
              size={24}
              onClick={() => setIsSettingsOpen(false)}
            />
          )}
        </>
      ) : (
        <Typography variant="h6" className="block">
          Log in
        </Typography>
      )}
    </div>
  );
};
