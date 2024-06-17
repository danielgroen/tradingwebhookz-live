import { useEffect, useState } from 'react';
import { TextField, Typography, Button } from '@mui/material';
import { BrokerState, OrderState } from '@states/index';

// https://docs.ccxt.com/#/exchanges/bybit
export const OrderForm = () => {
  const { brokerInstance } = BrokerState();
  const { stopLoss, setStopLoss, takeProfit, setTakeProfit, price, setPrice } = OrderState();

  const [balance, setBalance] = useState(0);

  // poll balance
  useEffect(() => {
    if (!balance) return;

    const interval = setInterval(async () => {
      const getBalance = await brokerInstance?.fetchBalance();

      setBalance(getBalance?.USDT?.free || 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [balance]);

  // init get balance
  useEffect(() => {
    if (!brokerInstance) return;
    const fetchData = async () => {
      const getBalance = await brokerInstance?.fetchBalance();

      setBalance(getBalance?.USDT?.free || 0);
    };

    fetchData();
  }, [brokerInstance]);

  return (
    <>
      <div>
        <Typography variant="h6" sx={{ mb: 2 }} className="block">
          Place order
        </Typography>
        <TextField fullWidth size="small" sx={{ mb: 2 }} label="Amount" InputProps={{ endAdornment: 'contracts' }} />
        <TextField fullWidth size="small" sx={{ mb: 2 }} label="Symbol" />
        <TextField
          fullWidth
          size="small"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          sx={{ mb: 2 }}
          label="Price"
          InputProps={{ endAdornment: '$' }}
        />
        <TextField disabled focused fullWidth size="small" sx={{ mb: 2 }} label="Leverage" />
        <TextField
          color="error"
          value={stopLoss}
          onChange={(e) => setStopLoss(e.target.value)}
          fullWidth
          focused
          size="small"
          sx={{ mb: 2, pr: 0.5, width: '50%' }}
          label="SL"
        />
        <TextField
          fullWidth
          value={takeProfit}
          onChange={(e) => setTakeProfit(e.target.value)}
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
};
