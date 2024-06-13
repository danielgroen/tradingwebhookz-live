import { useEffect, useState } from 'react';
import { SidebarAnonymous } from './components/SidebarAnonymous';
import { Box } from '@mui/material';

// Utility function to load external script
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script ${src}`));
    document.head.appendChild(script);
  });
};

export default function App() {
  const [ccxtLoaded, setCcxtLoaded] = useState(false);

  useEffect(() => {
    loadScript('https://cdn.jsdelivr.net/npm/ccxt@4.3.44/dist/ccxt.browser.min.js')
      .then(() => {
        setCcxtLoaded(true);
      })
      .catch((error) => {
        console.error('Failed to load ccxt:', error);
      });
  }, []);

  useEffect(() => {
    if (ccxtLoaded) {
      const ccxt = (window as any).ccxt;
      console.log('ccxt is loaded:', ccxt);
    }
  }, [ccxtLoaded]);

  return (
    <div className="overflow-x-hidden">
      <div className="bg-gradient" />
      <Box sx={{ display: 'flex' }}>
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
            <SidebarAnonymous />
          </Box>
        </div>
      </Box>
    </div>
  );
}
