import { Box } from '@mui/material';
import { LoginForm, Header, SettingsForm, OrderForm } from '@components/index';
import { GlobalState } from '@states/index';

export const Sidebar = () => {
  const { isLoggedIn, isSettingsOpen, showSidebar } = GlobalState();

  return (
    <div
      style={{
        width: showSidebar ? '400px' : '0px',
        display: 'flex',
        height: '100vh',
        flexDirection: 'column',
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
