
import { TradingviewComponent } from './components/TradingviewComponent';
import { SidebarAnonymous } from './components/SidebarAnonymous';
import { Box } from '@mui/material';


export default function App() {
  return (
    <div className="overflow-x-hidden">
      <div className="bg-gradient" />
      <Box sx={{ display: 'flex' }}>
        <TradingviewComponent />
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
            hey there!
            <SidebarAnonymous />
          </Box>
        </div>
      </Box>
    </div>
  );
}
