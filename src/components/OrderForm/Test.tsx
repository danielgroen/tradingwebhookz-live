import { useEffect, useState, type FC } from 'react';
import { Typography, TextField, Button } from '@mui/material';
import { ORDER_TYPE } from '@constants/index';
import { OrderState, SettingsState, ApiState } from '@states/index';
import { stepSizeToFixed } from '@utils/index';

// NOTE NOTE NOTE.... THIS IS A TEST COMPONENT... NOT A REAL COMPONENT
export const RiskCalculator: FC = () => {
  const [accountBalance, setAccountBalance] = useState<number>(1000); // Fixed account balance
  const [risk, setRisk] = useState<number>(1);
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number>(0);
  const [takeProfit, setTakeProfit] = useState<number>(0);
  const [makerFee, setMakerFee] = useState<number>(0.1);
  const [takerFee, setTakerFee] = useState<number>(0.2);
  const [minimalOrderSize, setMinimalOrderSize] = useState<number>(0.001);

  const [positionSize, setPositionSize] = useState<number>(0);
  const [potentialProfit, setPotentialProfit] = useState<number>(0);
  const [potentialLoss, setPotentialLoss] = useState<number>(0);
  const [requiredLeverage, setRequiredLeverage] = useState<number>(0);
  const [orderPercent, setOrderPercent] = useState<number>(0);
  const [orderTypeStoploss, setOrderTypeStoploss] = useState<string>(ORDER_TYPE.LIMIT);
  const [orderTypeTakeProfit, setOrderTypeTakeProfit] = useState<string>(ORDER_TYPE.LIMIT);
  const [side, setSide] = useState<string>('long');

  const { apiMinOrderSize, apiLeverageStepSize } = ApiState();

  useEffect(() => {
    if (!entryPrice || !stopLoss || !accountBalance || !risk || !apiMinOrderSize || !apiLeverageStepSize) return;

    const minimalOrderSize = parseFloat(apiMinOrderSize);
    const orderSize = accountBalance * (orderPercent / 100);

    const feesOpen = makerFee / 100;
    const feesLoss = orderTypeStoploss === ORDER_TYPE.MARKET ? takerFee / 100 : makerFee / 100;
    const feesProfit = orderTypeTakeProfit === ORDER_TYPE.MARKET ? takerFee / 100 : makerFee / 100;

    const riskAmount = orderSize * (parseFloat(risk) / 100);
    const lossPerUnit = entryPrice - stopLoss;

    let positionSizeWithoutFees = riskAmount / (Math.abs(lossPerUnit) + feesOpen + feesLoss);
    positionSizeWithoutFees = Math.ceil(positionSizeWithoutFees / minimalOrderSize) * minimalOrderSize;

    setPositionSize(positionSizeWithoutFees);

    const potentialProfit =
      side === 'long'
        ? (takeProfit - entryPrice) * positionSizeWithoutFees - feesProfit * positionSizeWithoutFees
        : (entryPrice - takeProfit) * positionSizeWithoutFees - feesProfit * positionSizeWithoutFees;

    const potentialLoss =
      side === 'long'
        ? (entryPrice - stopLoss) * positionSizeWithoutFees + feesLoss * positionSizeWithoutFees
        : (stopLoss - entryPrice) * positionSizeWithoutFees + feesLoss * positionSizeWithoutFees;

    setPotentialProfit(potentialProfit);
    setPotentialLoss(potentialLoss);

    const positionValue = positionSizeWithoutFees * entryPrice;
    const requiredLeverage = positionValue / orderSize + 1;
    setRequiredLeverage(requiredLeverage.toFixed(stepSizeToFixed(apiLeverageStepSize)));
  }, [
    accountBalance,
    stopLoss,
    takeProfit,
    entryPrice,
    risk,
    orderPercent,
    side,
    makerFee,
    takerFee,
    orderTypeStoploss,
    orderTypeTakeProfit,
    apiMinOrderSize,
  ]);

  return (
    <div>
      <Typography variant="h4">Crypto Position Size Calculator</Typography>
      <TextField label="Account Balance" type="number" value={accountBalance} disabled fullWidth margin="normal" />
      <TextField
        label="Risk (%)"
        type="number"
        value={risk}
        onChange={(e) => setRisk(parseFloat(e.target.value))}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Entry Price"
        type="number"
        value={entryPrice}
        onChange={(e) => setEntryPrice(parseFloat(e.target.value))}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Stop Loss"
        type="number"
        value={stopLoss}
        onChange={(e) => setStopLoss(parseFloat(e.target.value))}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Take Profit"
        type="number"
        value={takeProfit}
        onChange={(e) => setTakeProfit(parseFloat(e.target.value))}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Maker Fee (%)"
        type="number"
        value={makerFee}
        onChange={(e) => setMakerFee(parseFloat(e.target.value))}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Taker Fee (%)"
        type="number"
        value={takerFee}
        onChange={(e) => setTakerFee(parseFloat(e.target.value))}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Minimal Order Size"
        type="number"
        value={minimalOrderSize}
        onChange={(e) => setMinimalOrderSize(parseFloat(e.target.value))}
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          /* trigger calculation if needed */
        }}
      >
        Calculate
      </Button>
      <Typography variant="h6">Position Size: {positionSize.toFixed(4)}</Typography>
      <Typography variant="h6">Potential Profit: {potentialProfit.toFixed(4)} USDT</Typography>
      <Typography variant="h6">Potential Loss: {potentialLoss.toFixed(4)} USDT</Typography>
      <Typography variant="h6">Required Leverage: {requiredLeverage.toFixed(2)}x</Typography>
    </div>
  );
};

export default RiskCalculator;
