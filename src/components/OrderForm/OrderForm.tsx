import { useEffect, useState } from 'react';
import { TextField, Typography, Button, Chip } from '@mui/material';
import { BrokerState, OrderState, SettingsState } from '@states/index';

// Calculation functions
const calculatePositionSize = (initialInvestment, risk, entryPrice, stopLossPrice) => {
  const positionSize = (initialInvestment * risk) / (entryPrice - stopLossPrice);
  return positionSize;
};

const calculateContracts = (positionSize, entryPrice) => {
  return positionSize * entryPrice;
};

const calculateLeverage = (contracts, accountBalance) => {
  if (contracts <= accountBalance) return 1;
  return contracts / accountBalance;
};

const calculatePotentialProfit = (takeProfitPrice, entryPrice, positionSize) => {
  return (takeProfitPrice - entryPrice) * positionSize;
};

const calculatePotentialLoss = (entryPrice, stopLossPrice, positionSize) => {
  return (entryPrice - stopLossPrice) * positionSize;
};

export const OrderForm = () => {
  const { brokerInstance } = BrokerState();
  const {
    stopLoss,
    setStopLoss,
    takeProfit,
    setTakeProfit,
    price,
    setPrice,
    direction,
    setDirection,
    symbol,
    riskReward,
    setRiskReward,
    contracts,
    setContracts,
    leverage,
    setLeverage,
  } = OrderState();
  const { risk, collateral } = SettingsState();

  const [accountBalance, setAccountBalance] = useState(0);
  const [potentialProfit, setPotentialProfit] = useState(0);
  const [potentialLoss, setPotentialLoss] = useState(0);

  // Poll balance
  useEffect(() => {
    if (!accountBalance) return;

    const interval = setInterval(async () => {
      const getBalance = await brokerInstance?.fetchBalance();
      setAccountBalance(getBalance?.USDT?.free || 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [accountBalance]);

  // Init get balance
  useEffect(() => {
    if (!brokerInstance) return;
    const fetchData = async () => {
      const getBalance = await brokerInstance?.fetchBalance();
      setAccountBalance(getBalance?.USDT?.free || 0);
    };
    fetchData();
  }, [brokerInstance]);

  // Calculate position size, leverage, potential profit, and potential loss
  useEffect(() => {
    if (stopLoss === '' || takeProfit === '' || price === '' || risk === '' || !accountBalance) return;

    const entryPrice = parseFloat(price);
    const stopLossPrice = parseFloat(stopLoss);
    const takeProfitPrice = parseFloat(takeProfit);
    const initialInvestment = accountBalance;
    const riskPercentage = parseFloat(risk) / 100;

    const positionSize = calculatePositionSize(initialInvestment, riskPercentage, entryPrice, stopLossPrice);
    const _contracts = calculateContracts(positionSize, entryPrice);
    const _leverage = calculateLeverage(_contracts, accountBalance);

    setContracts(_contracts.toFixed(2));
    setLeverage(_leverage.toFixed(2));

    const _potentialProfit = calculatePotentialProfit(takeProfitPrice, entryPrice, positionSize);
    const _potentialLoss = calculatePotentialLoss(entryPrice, stopLossPrice, positionSize);

    setPotentialProfit(_potentialProfit.toFixed(2));
    setPotentialLoss(_potentialLoss.toFixed(2));
  }, [stopLoss, takeProfit, price, risk, accountBalance]);

  useEffect(() => {
    if (stopLoss === '' && takeProfit === '') {
      setDirection(null);
      setRiskReward('');
    } else if (+stopLoss > +price || +takeProfit < +price) setDirection('short');
    else if (+stopLoss < +price || +takeProfit > +price) setDirection('long');
  }, [stopLoss, takeProfit, price]);

  return (
    <>
      <div>
        <Typography variant="h6" sx={{ mb: 2 }} className="block">
          Place order
          {direction && (
            <Chip
              sx={{ ml: 1, opacity: 0.9 }}
              color={direction === 'long' ? 'success' : 'error'}
              size="small"
              label={direction}
            />
          )}
        </Typography>
        <TextField
          value={contracts}
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          label="Order in USDT"
          InputProps={{ endAdornment: 'USDT' }}
        />
        <TextField
          disabled
          fullWidth
          value={symbol}
          size="small"
          sx={{ mb: 2, pr: 1, width: '50%', opacity: 0.5 }}
          label="Symbol"
        />
        <TextField
          disabled
          fullWidth
          value={leverage}
          size="small"
          sx={{ mb: 2, pl: 0.5, width: '50%', opacity: 0.5 }}
          label="Leverage"
        />
        <TextField
          fullWidth
          size="small"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          sx={{ mb: 2 }}
          label="Order Price"
          InputProps={{ endAdornment: 'USDT' }}
        />
        <TextField
          color="error"
          value={stopLoss}
          onChange={(e) => setStopLoss(e.target.value)}
          fullWidth
          focused
          size="small"
          sx={{ mb: 1, pr: 1, width: '50%' }}
          label="SL"
        />
        <TextField
          fullWidth
          value={takeProfit}
          onChange={(e) => setTakeProfit(e.target.value)}
          color="success"
          focused
          size="small"
          sx={{ mb: 1, pl: 0.5, width: '50%' }}
          label="TP"
        />
        <Typography variant="caption" sx={{ ml: 1 }} className="block">
          Risk/Reward Ratio: {riskReward}
        </Typography>
        <Typography variant="caption" sx={{ ml: 1 }} className="block">
          Profit: {potentialProfit} {collateral}
        </Typography>
        <Typography variant="caption" sx={{ mb: 2, ml: 1 }} className="block">
          Loss: {potentialLoss} {collateral}
        </Typography>
      </div>
      <div style={{ marginBottom: 8, marginTop: 'auto' }}>
        <div>Balance: $ {(+accountBalance)?.toFixed(2)}</div>
        <div>PNL of current trade: $ 0.00</div>
      </div>
      <Button variant="outlined" fullWidth>
        Place order
      </Button>
    </>
  );
};
