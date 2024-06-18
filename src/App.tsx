import { Box } from '@mui/material';
import { TradingviewWidget, Sidebar } from '@components/index';

import './globals.css';

export default function App() {
  return (
    <div className="overflow-x-hidden">
      <div className="bg-gradient" />
      <Box sx={{ display: 'flex' }}>
        <TradingviewWidget />
        <Sidebar />
      </Box>
    </div>
  );
}
