import { Box } from '@mui/material';
import { TradingviewWidget, Sidebar } from '@components/index';

import './globals.css';

export default function App() {
  return (
    <div className="overflow-x-hidden">
      <div className="bg-gradient" />
      <Box sx={{ display: 'flex' }}>
        <TradingviewWidget />
        <div
          style={{
            width: '400px',
            padding: 16,
            display: 'flex',
            height: '100vh',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Sidebar />
          </Box>
        </div>
      </Box>
    </div>
  );
}
