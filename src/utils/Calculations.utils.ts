export const calculatePositionSize = (riskAmount, entryPrice, stopLossPrice, fees, side) => {
  const potentialLossPerUnit = Math.abs(entryPrice - stopLossPrice);
  const totalFees = riskAmount * fees;
  const adjustedRiskAmount = riskAmount - totalFees;
  const grossPositionSize = adjustedRiskAmount / potentialLossPerUnit;

  return grossPositionSize;
};

export const calculatePositionValue = (positionSize, entryPrice) => {
  return positionSize * entryPrice;
};

export const calculateLeverage = (positionValue, accountBalance, maxLeverage) => {
  let leverage = positionValue / accountBalance + 1; // +1 a hack to always have enough margin, maybe we can even add 0.1 (or look at the min stepsize)

  if (leverage > maxLeverage) leverage = maxLeverage;
  if (leverage < 1) leverage = 1;
  return leverage;
};

export const calculatePotentialProfit = (takeProfitPrice, entryPrice, positionSize, fees, side) => {
  const grossProfit = ['long', 'buy'].includes(side)
    ? (takeProfitPrice - entryPrice) * positionSize
    : (entryPrice - takeProfitPrice) * positionSize;
  const totalFees = positionSize * takeProfitPrice * fees;
  return grossProfit - totalFees;
};

export const calculatePotentialLoss = (entryPrice, stopLossPrice, positionSize, fees, side) => {
  const grossLoss = ['long', 'buy'].includes(side)
    ? (entryPrice - stopLossPrice) * positionSize
    : (stopLossPrice - entryPrice) * positionSize;
  const totalFees = positionSize * stopLossPrice * fees;
  return grossLoss + totalFees;
};
