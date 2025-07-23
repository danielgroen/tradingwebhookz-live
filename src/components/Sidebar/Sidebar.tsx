import { Box, Link, Typography } from '@mui/material';
import { LoginForm, Header, SettingsForm, OrderForm } from '@components/index';
import { GlobalState } from '@states/index';
import { TbLayoutSidebarRightExpandFilled } from 'react-icons/tb';

export const Sidebar = () => {
  const { isLoggedIn, isSettingsOpen, showSidebar, setShowSidebar } = GlobalState();

  return (
    <div
      style={{
        display: 'flex',
        width: showSidebar ? '315px' : '60px',
        minWidth: showSidebar ? '315px' : '60px',
        height: '100vh',
        overflow: 'auto',
        flexDirection: 'column',
      }}
    >
      {!showSidebar && (
        <TbLayoutSidebarRightExpandFilled
          style={{ cursor: 'pointer', marginLeft: '20px', marginTop: '20px' }}
          size={24}
          onClick={() => setShowSidebar(true)}
        />
      )}
      <Box
        sx={{ flexGrow: 1, display: 'flex', p: 2, boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)', flexDirection: 'column' }}
      >
        <div className="flex flex-col h-[100%]">
          {showSidebar && (
            <>
              <Header />
              {!isLoggedIn ? <LoginForm /> : <>{isSettingsOpen ? <SettingsForm /> : <OrderForm />}</>}
            </>
          )}
        </div>
      </Box>

      <Typography
        textAlign="center"
        fontSize={10}
        height={'39px'}
        sx={{
          p: '5px',
          borderTop: '1px solid #2a2e39',
          background: '#131722',
          opacity: 0.8,
          display: showSidebar ? 'block' : 'none',
        }}
      >
        <Link fontSize={10} href="https://www.tradingview.com" rel="noopener dofollow" target="_blank">
          Tradingview
        </Link>{' '}
        is a platform for traders and high-performance market data to help track coins like{' '}
        <Link fontSize={10} href="https://www.tradingview.com/symbols/BTCUSDT/" rel="noopener dofollow" target="_blank">
          BTCUSDT
        </Link>{' '}
        prices on charts.
      </Typography>
    </div>
  );
};
