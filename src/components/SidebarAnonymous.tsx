import { useMemo, useState } from 'react';
import { TextField, Button, Chip, FormControlLabel, Switch, Typography } from '@mui/material';
// import {version, exchanges} from 'ccxt';
import { FaGear } from 'react-icons/fa6';
import { FaChevronLeft } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

export function SidebarAnonymous() {
  const [apiKey, setApiKey] = useState('2CsRgnKhTpvOuol7EE');
  const [apiSecret, setApiSecret] = useState('TLAzJpunuJ7QRcyhhdI9xQR7snEI4N4RfR2M');
  const [restClient, setRestClient] = useState(false);
  // const [balance, setBalance] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isTestnet, setIsTestnet] = useState(true);

  const handleLogin = async () => {
    const exchange = new (window as any).ccxt.binance();
    const ticker = await exchange.fetchTicker('BTC/USDT');
    console.log(ticker);
    // setRestClient(
    //   new RestClientV5({
    //     key: apiKey,
    //     secret: apiSecret,
    //     testnet: isTestnet,
    //   })
    // );
  };

  const handleReset = () => {
    setRestClient(false);
    setApiKey('');
    setApiSecret('');
  };

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
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
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
      // if (!balance) return <></>;
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
            {/* <div>Balance: $ {(+balance)?.toFixed(2)}</div> */}
            <div>PNL of current trade: $ 0.00</div>
          </div>
          <Button variant="outlined" fullWidth>
            Place order
          </Button>
        </>
      );
    }, []);

  // useEffect(() => {
  //   if (!restClient) return;
  //   const fetchData = async () => {
  //     try {
  //       await restClient
  //         .getWalletBalance({
  //           accountType: 'CONTRACT',
  //           coin: 'USDT',
  //         })
  //         .then(({ result }) => {
  //           setBalance(result?.list[0].coin[0]?.walletBalance);
  //         });
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   fetchData();
  // }, [restClient]);

  return (
    <>
{!restClient && <FormLogin />}
      {restClient && (
        <>
          <div className="flex items-center justify-between mb-6">
            <Chip
              label={`${isTestnet ? '🚧' : '🟢'} ${apiKey.substring(0, 4)}*******${apiKey.substring(11)}`}
              onDelete={handleReset}
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
              // onClick={() => router.push(ROUTES.LOGIN)}
            />
          </div>
          {!showSettings && <FormPlaceOrder />}
          {showSettings && <FormSettings />}
        </>
      )}
    </>
  );
}
