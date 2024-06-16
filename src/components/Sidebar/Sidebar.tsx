import { useEffect, useMemo, useState } from 'react';
import { TextField, Button, Typography } from '@mui/material';
import { default as ccxt } from '@ccxt';
import { LoginForm, Header, SettingsForm } from '@components/index';

// https://docs.ccxt.com/#/exchanges/bybit
export const Sidebar = () => {
  const [restClient, setRestClient] = useState<any | null>(null);
  const [balance, setBalance] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isTestnet, setIsTestnet] = useState(true);

  // move to settings
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
      setBalance(getBalance.free.USDT);
    }, 1000);
    return () => clearInterval(interval);
  }, [balance]);

  // init get balance
  useEffect(() => {
    if (!restClient) return;
    const fetchData = async () => {
      const getBalance = await restClient.fetchBalance();
      setBalance(getBalance.free.USDT);
    };

    fetchData();
  }, [restClient]);

  const FormPlaceOrder = () =>
    useMemo(() => {
      if (!balance) return <></>;
    }, []);

  return (
    <div>
      <Header />
      <LoginForm />
      {!showSettings && <FormPlaceOrder />}
      {showSettings && <FormSettings />}
    </div>
  );
};
