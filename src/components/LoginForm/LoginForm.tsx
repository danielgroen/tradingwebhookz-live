import { TextField, Button, FormControlLabel, Switch } from '@mui/material';
import ccxt from '@ccxt';
import { BrokerState, GlobalState } from '@states/index';

export const LoginForm = () => {
  const { setBrokerInstance, apiKey, setApiKey, secret, setSecret, isTestnet, setIsTestnet } = BrokerState();
  const { setIsLoggedIn } = GlobalState();

  const handleLogin = async () => {
    const account = new ccxt.bybit({ apiKey, secret });
    await account.setSandboxMode(isTestnet);
    setBrokerInstance(account);
    setIsLoggedIn(true);
  };

  return (
    <>
      <TextField
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
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
        label="🚧 Testnet"
      />
      <Button variant="outlined" sx={{ mb: 2 }} fullWidth onClick={handleLogin}>
        Login
      </Button>
    </>
  );
};
