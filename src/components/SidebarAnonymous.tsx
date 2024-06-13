import { useEffect, useMemo, useState } from 'react';
import { TextField, Button, Chip, FormControlLabel, Switch, Typography } from '@mui/material';
import { FaGear } from 'react-icons/fa6';
import { FaChevronLeft } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import {default as ccxt} from '@ccxt';

// https://docs.ccxt.com/#/exchanges/bybit
export function SidebarAnonymous() {
  const [apiKey, setApiKey] = useState('2CsRgnKhTpvOuol7EE');
  const [secret, setSecret] = useState('TLAzJpunuJ7QRcyhhdI9xQR7snEI4N4RfR2M');
  const [restClient, setRestClient] = useState<any | null>(null);
  const [balance, setBalance] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isTestnet, setIsTestnet] = useState(true);

  const handleLogin = async () => {
    const account = new ccxt.bybit({ apiKey, secret })
    await account.setSandboxMode(isTestnet)
    setRestClient(account)
  };

  const handleReset = () => {
    setRestClient(false);
    // setApiKey('');
    // setSecret('');
  };

  // poll balance
  useEffect(() => {
    if (!balance) return;
    
    const interval = setInterval(async () => {
      const getBalance = await restClient.fetchBalance();
      setBalance(getBalance.free.USDT)
    }, 1000);
    return () => clearInterval(interval);

  }, [balance]);

  // init get balance
  useEffect(() => {
    if (!restClient) return;
    const fetchData = async () => {
      const getBalance = await restClient.fetchBalance();
      setBalance(getBalance.free.USDT)
    };

    fetchData();
  }, [restClient]);

  const FormLogin = () =>
    useMemo(() => {
      if (restClient) return <></>;
      return (
        <>
          <Typography variant="h6" sx={{ mb: 2 }} className="block">
            Log in with your credentials
          </Typography>
          <TextField
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            autoFocus
            fullWidth
            size="small"
            sx={{ mb: 2 }}
            label="bybit api key"
          />
          <TextField
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            type="password"
            fullWidth
            size="small"
            sx={{ mb: 2 }}
            label="bybit api secret"
          />
          <FormControlLabel
            sx={{ mb: 2 }}
            control={<Switch checked={isTestnet} onChange={() => setIsTestnet(!isTestnet)} />}
            label={'🚧 Testnet'}
          />
          <Button variant="outlined" sx={{ mb: 2 }} fullWidth onClick={handleLogin}>
            Login
          </Button>
        </>
      );
    }, [restClient]);

  const FormSettings = () =>
    useMemo(() => {
      return (
        <div>
          <Typography variant="h6" sx={{ mb: 2 }} className="block">
            Settings
          </Typography>
          <TextField value="1%" size="small" sx={{ mb: 2, pr: 0.5, width: '50%' }} label="risk" />
          <TextField
            value="0.02%"
            size="small"
            sx={{ mb: 2, pl: 0.5, width: '50%' }}
            label="Fees"
          />
        </div>
      );
    }, []);

  const FormPlaceOrder = () =>
    useMemo(() => {
      if (!balance) return <></>;
      return (
        <>
          <div>
            <Typography variant="h6" sx={{ mb: 2 }} className="block">
              Place order
            </Typography>
            <TextField
              fullWidth
              size="small"
              sx={{ mb: 2 }}
              label="Amount"
              InputProps={{ endAdornment: 'contracts' }}
            />
            <TextField fullWidth size="small" sx={{ mb: 2 }} label="Symbol" />
            <TextField
              fullWidth
              size="small"
              sx={{ mb: 2 }}
              label="Price"
              InputProps={{ endAdornment: '$' }}
            />
            <TextField disabled focused fullWidth size="small" sx={{ mb: 2 }} label="Leverage" />
            <TextField
              color="error"
              fullWidth
              focused
              size="small"
              sx={{ mb: 2, pr: 0.5, width: '50%' }}
              label="SL"
            />
            <TextField
              fullWidth
              color="success"
              focused
              size="small"
              sx={{ mb: 2, pl: 0.5, width: '50%' }}
              label="TP"
            />
          </div>
          <div style={{ marginBottom: 8, marginTop: 'auto' }}>
            <div>Balance: $ {(+balance)?.toFixed(2)}</div>
            <div>PNL of current trade: $ 0.00</div>
          </div>
          <Button variant="outlined" fullWidth>
            Place order
          </Button>
        </>
      );
    }, []);

  return (
    <>
{!restClient && <FormLogin />}
      {restClient && (
        <>
          <div className="flex items-center justify-between mb-6">
            <Chip
              label={`${isTestnet ? '🚧' : '🟢'} ${apiKey.substring(0, 4)}*******${apiKey.substring(11)}`}
            />

            {!showSettings ? (
              <FaGear
                style={{ cursor: 'pointer', marginLeft: 'auto' }}
                size={18}
                onClick={() => setShowSettings(true)}
              />
            ) : (
              <FaChevronLeft
                size={18}
                style={{ cursor: 'pointer', marginLeft: 'auto' }}
                onClick={() => setShowSettings(false)}
              />
            )}
            <IoClose
              style={{ cursor: 'pointer', marginLeft: 16 }}
              size={24}
              onClick={handleReset}
            />
          </div>
          {!showSettings && <FormPlaceOrder />}
          {showSettings && <FormSettings />}
        </>
      )}
    </>
  );
}
