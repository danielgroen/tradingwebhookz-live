import { Box } from '@mui/material';
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
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
      }}
    >
      <Box sx={{ flexGrow: 1, display: 'flex', p: 2, flexDirection: 'column' }}>
        <div className="flex flex-col h-[100%]">
          {showSidebar && (
            <>
              <Header />
              {!isLoggedIn ? <LoginForm /> : <>{isSettingsOpen ? <SettingsForm /> : <OrderForm />}</>}
            </>
          )}
        </div>
      </Box>
    </div>
  );
};
