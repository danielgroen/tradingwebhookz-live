import { useState } from 'react';
import { Chip, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { FaGear } from 'react-icons/fa6';
import { GiBroom } from 'react-icons/gi';
import { GoInfo } from 'react-icons/go';
import { IoClose, IoLogOutOutline, IoChevronBack } from 'react-icons/io5';
import { SiMicrosoftexcel } from 'react-icons/si';
import { InfoDialog } from '@components/index';
import { AuthState, GlobalState, SettingsState, OrderState, ApiState } from '@states/index';

export const Header = () => {
  const { setBrokerInstance } = ApiState();
  const { orderbook } = SettingsState();
  const { isLoggedIn, isSettingsOpen, setIsSettingsOpen, setShowSidebar, setIsLoggedIn } = GlobalState();
  const { clearStore, apiKey, isDemoTrade } = AuthState();
  const { isOrderFilled, clearOrder } = OrderState();

  const [openDialog, setOpenDialog] = useState(false);

  const handleLogout = () => {
    clearStore();
    setIsSettingsOpen(false);
    setIsLoggedIn(false);
    setBrokerInstance(null);
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
              sx={{
                mr: 'auto',
                background: isDemoTrade
                  ? 'linear-gradient(90deg, rgba(255,153,0,1) 0%, rgba(255,107,87,1) 100%)'
                  : '#66bb6a',
              }}
              label={`${isDemoTrade ? '⚠️' : '🟢'} ${apiKey.substring(0, 4)}*******${apiKey.substring(11)}`}
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
        <div className="flex items-center justify-end mb-[-26px] gap-3 z-10">
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
              {isOrderFilled() && (
                <GiBroom
                  style={{ cursor: 'pointer' }}
                  size={24}
                  opacity={0.9}
                  onClick={() => {
                    clearOrder();
                  }}
                />
              )}
              <GoInfo
                style={{ cursor: 'pointer' }}
                size={24}
                opacity={0.9}
                onClick={() => {
                  setOpenDialog(true);
                }}
              />
              {orderbook && (
                <SiMicrosoftexcel
                  style={{ cursor: 'pointer' }}
                  size={24}
                  onClick={() => {
                    window.open(`https://${orderbook}`, '_blank');
                  }}
                />
              )}
            </>
          )}
        </div>
      )}
      <InfoDialog open={openDialog} setOpen={setOpenDialog} />
    </>
  );
};
