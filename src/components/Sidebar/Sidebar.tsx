import { Box, Link } from '@mui/material';
import { LoginForm, Header, SettingsForm, OrderForm } from '@components/index';
import { GlobalState } from '@states/index';

export const Sidebar = () => {
  const { isLoggedIn, isSettingsOpen, showSidebar } = GlobalState();

  return (
    <div
      style={{
        display: showSidebar ? 'flex' : 'none',
        width: '315px',
        minWidth: '315px',
        height: '100vh',
        overflow: 'auto',
        flexDirection: 'column',
      }}
    >
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
      <Link
        textAlign="center"
        fontSize={10}
        height={'39px'}
        sx={{ p: '11px', borderTop: '1px solid #2a2e39', background: '#131722' }}
        href="https://www.tradingview.com/"
        rel="noopener nofollow"
        target="_blank"
      >
        Track all markets on TradingView
      </Link>
    </div>
  );
};
