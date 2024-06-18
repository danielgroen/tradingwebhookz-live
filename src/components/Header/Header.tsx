import { Chip, Typography } from '@mui/material';
import { FaGear } from 'react-icons/fa6';
import { IoClose, IoLogOutOutline, IoChevronBack } from 'react-icons/io5';
import { BrokerState, GlobalState } from '@states/index';

export const Header = () => {
  const { apiKey, isTestnet } = BrokerState();
  const { isLoggedIn, isSettingsOpen, setIsSettingsOpen, setShowSidebar, setIsLoggedIn } = GlobalState();

  const { setBrokerInstance, setApiKey, setSecret } = BrokerState();

  const handleLogout = () => {
    setIsSettingsOpen(false);
    setIsLoggedIn(false);
    setBrokerInstance(null);
    setApiKey('2CsRgnKhTpvOuol7EE');
    setSecret('TLAzJpunuJ7QRcyhhdI9xQR7snEI4N4RfR2M');
  };

  return (
    <div
      className="flex items-center justify-between mb-6 pb-4"
      style={{ borderBottom: '1px solid rgba(43, 58, 96, 0.54)' }}
    >
      {isLoggedIn ? (
        <>
          <Chip label={`${isTestnet ? '🚧' : '🟢'} ${apiKey.substring(0, 4)}*******${apiKey.substring(11)}`} />
          <IoLogOutOutline
            style={{
              cursor: 'pointer',
              marginLeft: 'auto',
              marginRight: 12,
              color: 'red',
              transform: 'rotate(180deg)',
            }}
            size={26}
            opacity={0.9}
            onClick={handleLogout}
          />
          {!isSettingsOpen ? (
            <FaGear style={{ cursor: 'pointer' }} size={18} onClick={() => setIsSettingsOpen(true)} />
          ) : (
            <IoChevronBack
              style={{ cursor: 'pointer', marginLeft: -6 }}
              size={24}
              onClick={() => setIsSettingsOpen(false)}
            />
          )}
          <IoClose style={{ cursor: 'pointer', marginLeft: 12 }} size={24} onClick={() => setShowSidebar(false)} />
        </>
      ) : (
        <Typography variant="h6" className="block">
          Log in
        </Typography>
      )}
    </div>
  );
};
