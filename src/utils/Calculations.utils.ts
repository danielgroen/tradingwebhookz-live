export const calculatePositionSize = (riskAmount, entryPrice, stopLossPrice, makerFee, side) => {
  const potentialLossPerUnit = Math.abs(entryPrice - stopLossPrice);
  const totalFees = riskAmount * (makerFee / 100);
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
