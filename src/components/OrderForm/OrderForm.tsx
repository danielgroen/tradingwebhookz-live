import { useEffect, useState } from 'react';
import { Box, TextField, Typography, Button, Chip, CircularProgress } from '@mui/material';
import { BrokerState, OrderState, SettingsState } from '@states/index';

// Calculation functions
// Calculation functions
const calculatePositionSize = (initialInvestment, risk, entryPrice, stopLossPrice) => {
  const positionSize = (initialInvestment * risk) / Math.abs(entryPrice - stopLossPrice);
  return positionSize;
};

const calculate = (positionSize, entryPrice) => {
  return positionSize * entryPrice;
};

const calculateLeverage = (qty, accountBalance) => {
  if (qty <= accountBalance) return 1;
  return qty / accountBalance;
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
    qty,
    setQty,
    leverage,
    setLeverage,
  } = OrderState();
  const { risk, collateral } = SettingsState();

  const [accountBalance, setAccountBalance] = useState(null);
  const [potentialProfit, setPotentialProfit] = useState(0);
  const [potentialLoss, setPotentialLoss] = useState(0);

  // Poll balance
  useEffect(() => {
    if (!accountBalance || !collateral) return;

    const interval = setInterval(async () => {
      const getBalance = await brokerInstance?.fetchBalance();
      setAccountBalance(getBalance[collateral]?.free || 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [accountBalance, collateral]);

  // Init get balance
  useEffect(() => {
    if (!brokerInstance || !collateral) return;
    const fetchData = async () => {
      const getBalance = await brokerInstance?.fetchBalance();
      setAccountBalance(getBalance[collateral]?.free || 0);
    };
    fetchData();
  }, [brokerInstance, collateral]);

  // Calculate position size, leverage, potential profit, and potential loss
  useEffect(() => {
    if (stopLoss === '' || takeProfit === '' || price === '' || risk === '' || !accountBalance) return;

    const entryPrice = parseFloat(price);
    const stopLossPrice = parseFloat(stopLoss);
    const takeProfitPrice = parseFloat(takeProfit);
    const initialInvestment = accountBalance;
    const riskPercentage = parseFloat(risk) / 100;

    const positionSize = calculatePositionSize(initialInvestment, riskPercentage, entryPrice, stopLossPrice);
    const _qty = calculate(positionSize, entryPrice);
    const _leverage = calculateLeverage(_qty, accountBalance);

    setQty(_qty.toFixed(2));
    setLeverage(_leverage.toFixed(2));

    const _potentialProfit = calculatePotentialProfit(takeProfitPrice, entryPrice, positionSize);
    const _potentialLoss = calculatePotentialLoss(entryPrice, stopLossPrice, positionSize);

    setPotentialProfit(_potentialProfit.toFixed(2));
    setPotentialLoss(_potentialLoss.toFixed(2));
  }, [stopLoss, takeProfit, price, risk, accountBalance]);

  const handlePlaceOrder = async () => {
    if (!direction || !symbol || !qty || !price || !stopLoss || !takeProfit || !leverage) alert('Fill all fields');

    // Set leverage
    try {
      await brokerInstance?.setLeverage(parseFloat(leverage), symbol);
    } catch (error) {
      console.log(error);
    }

    // Place order
    console.log(parseFloat(stopLoss), parseFloat(takeProfit));

    try {
      const placeOrder = await brokerInstance?.createOrder(
        symbol,
        'limit',
        direction === 'long' ? 'buy' : 'sell',
        parseFloat(qty) / parseFloat(price),
        parseFloat(price),
        {
          marketUnit: 'quoteCoin',
          stopLoss: {
            type: 'limit', // or 'market', this field is not necessary if limit price is specified
            price: parseFloat(stopLoss), // limit price for a limit stop loss order
            triggerPrice: parseFloat(stopLoss), // stop price for a stop market order
          },
          takeProfit: {
            type: 'limit', // please, no limit price for a market take profit order (ignored)
            price: parseFloat(takeProfit), // this field is not necessary for a market take profit order
            triggerPrice: parseFloat(takeProfit),
          },
        }
      );
      console.log(placeOrder);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (stopLoss === '' && takeProfit === '') {
      setDirection(null);
      setRiskReward('');
    } else if (+stopLoss > +price || +takeProfit < +price) setDirection('short');
    else if (+stopLoss < +price || +takeProfit > +price) setDirection('long');
  }, [stopLoss, takeProfit, price]);

  if (accountBalance === 0) return <div>Insufficient balance, try a different collateral than {collateral}</div>;
  if (!accountBalance)
    return (
      <Box sx={{ alignSelf: 'center', mt: 'auto', mb: 'auto' }}>
        <Typography variant="h6" sx={{ mb: 2, opacity: 0.7 }} className="inline">
          <CircularProgress size={20} sx={{ mr: 1, mb: -0.5 }} />
        </Typography>
      </Box>
    );

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
          value={qty}
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          label="Order by qty"
          InputProps={{ endAdornment: symbol.split(collateral)[0] }}
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
          sx={{ mb: 2, pl: 0.5, width: '50%' }}
          label="TP"
        />
        <div className="flex justify-between">
          {potentialLoss > 0 && (
            <Typography variant="caption" sx={{ display: 'block' }}>
              L:{' '}
              <Typography variant="caption" color="error">
                {potentialLoss}
              </Typography>{' '}
              {collateral}
            </Typography>
          )}
          {riskReward && (
            <Typography variant="caption" sx={{ display: 'block' }}>
              RR:{' '}
              <Typography variant="caption" color="primary.main">
                {riskReward}
              </Typography>
            </Typography>
          )}
          {potentialProfit > 0 && (
            <Typography variant="caption" sx={{ display: 'block' }}>
              P:{' '}
              <Typography variant="caption" color="success.light">
                {potentialProfit}
              </Typography>{' '}
              {collateral}
            </Typography>
          )}
        </div>
      </div>
      <div style={{ marginBottom: 8, marginTop: 'auto' }}>
        <div>
          Balance: {(+accountBalance)?.toFixed(2)} {collateral}
        </div>
        <div>PNL of current trade: $ 0.00</div>
      </div>
      <Button onClick={handlePlaceOrder} disabled={!accountBalance} variant="outlined" fullWidth>
        Place order
      </Button>
    </>
  );
};
