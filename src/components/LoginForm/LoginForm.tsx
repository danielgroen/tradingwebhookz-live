import { useEffect, useState } from 'react';
import { TextField, Button, FormControlLabel, Switch, Typography, Link, Checkbox } from '@mui/material';
import ccxt from 'ccxt';
import { enqueueSnackbar } from 'notistack';
import { GlobalState, BrokerState } from '@states/index'; // Adjust the import based on your project structure

export const LoginForm = () => {
  const {
    setBrokerInstance,
    apiKey,
    setApiKey,
    secret,
    setSecret,
    isTestnet,
    setIsTestnet,
    rememberMe,
    setRememberMe,
  } = BrokerState();
  const { setIsLoggedIn } = GlobalState();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    const account = new ccxt.bybit({ apiKey, secret });
    account.setSandboxMode(isTestnet);
    setIsLoggingIn(true);

    try {
      // Make a test API call to verify the credentials
      await account.fetchBalance();

      setIsLoggedIn(true);
      setIsLoggingIn(false);
      setBrokerInstance(account);
      enqueueSnackbar('Login successful!', {
        variant: 'success',
        autoHideDuration: 2000,
      });
    } catch (error) {
      setIsLoggedIn(false);
      setIsLoggingIn(false);
      enqueueSnackbar('Login failed. Please check your API key and secret.', {
        variant: 'error',
      });
    }
  };

  useEffect(() => {
    if (apiKey && secret) handleLogin();
  }, []);

  if (isLoggingIn) return <Typography variant="body2">Logging in...</Typography>;

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
        sx={{ mb: 1 }}
        label="bybit api secret"
      />
      <FormControlLabel
        sx={{ mb: 4, mr: 0 }}
        control={<Switch checked={isTestnet} color="warning" onChange={() => setIsTestnet(!isTestnet)} />}
        label="Testnet"
        labelPlacement="start"
      />

      <Button variant="outlined" sx={{ mb: 1, mt: 'auto' }} fullWidth onClick={handleLogin}>
        Login
      </Button>

      <div className="flex justify-between items-center">
        <Typography variant="caption" sx={{ ml: 1 }}>
          or{' '}
          <Link href="https://www.bybit.com/invite?ref=GDRBYQD" target="_blank">
            Register
          </Link>
        </Typography>
        <FormControlLabel
          sx={{ mr: 0 }}
          control={<Checkbox size="small" onClick={() => setRememberMe(!rememberMe)} checked={rememberMe} />}
          label={<Typography variant="caption">Remember me</Typography>}
        />
      </div>
    </>
  );
};
