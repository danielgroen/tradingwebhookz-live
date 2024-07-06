// Calculation functions

export const calculatePositionSize = (riskAmount, entryPrice, stopLossPrice, makerFee, side) => {
  const potentialLossPerUnit = Math.abs(entryPrice - stopLossPrice);
  const grossPositionSize = riskAmount / potentialLossPerUnit;
  const totalFees = grossPositionSize * entryPrice * (makerFee / 100);
  const netPositionSize = (riskAmount - totalFees) / potentialLossPerUnit;

  return netPositionSize;
};

export const calculatePositionValue = (positionSize, entryPrice) => {
  return positionSize * entryPrice;
};

export const calculateLeverage = (positionValue, accountBalance, maxLeverage) => {
  let leverage = positionValue / accountBalance;

  if (leverage > maxLeverage) leverage = maxLeverage;
  if (leverage < 1) leverage = 1;
  return leverage;
};

export const calculatePotentialProfit = (takeProfitPrice, entryPrice, positionSize, makerFee, side) => {
  const grossProfit =
    side === 'buy' ? (takeProfitPrice - entryPrice) * positionSize : (entryPrice - takeProfitPrice) * positionSize;
  const totalFees = positionSize * takeProfitPrice * (makerFee / 100);
  return grossProfit - totalFees;
};

export const calculatePotentialLoss = (entryPrice, stopLossPrice, positionSize, makerFee, side) => {
  const grossLoss =
    side === 'buy' ? (entryPrice - stopLossPrice) * positionSize : (stopLossPrice - entryPrice) * positionSize;
  const totalFees = positionSize * stopLossPrice * (makerFee / 100);
  return grossLoss + totalFees;
};
