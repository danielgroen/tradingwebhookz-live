export const calculatePositionSize = (initialInvestment, risk, entryPrice, stopLossPrice, makerFee) => {
  const riskAmount = initialInvestment * risk;
  const potentialLossPerUnit = Math.abs(entryPrice - stopLossPrice);
  const grossPositionSize = riskAmount / potentialLossPerUnit;

  // Adjust position size to include maker fees
  const totalFees = grossPositionSize * entryPrice * (makerFee / 100);
  const netPositionSize = (riskAmount - totalFees) / potentialLossPerUnit;

  return netPositionSize;
};

export const calculate = (positionSize, entryPrice) => {
  return positionSize * entryPrice;
};

export const calculateLeverage = (positionValue, accountBalance, maxLeverage) => {
  let leverage = positionValue / accountBalance;
  if (leverage > maxLeverage) leverage = maxLeverage;
  if (leverage < 1) leverage = 1;
  return leverage;
};

export const calculatePotentialProfit = (takeProfitPrice, entryPrice, positionSize, makerFee) => {
  const grossProfit = (takeProfitPrice - entryPrice) * positionSize;
  const totalFees = positionSize * takeProfitPrice * (makerFee / 100);
  return grossProfit - totalFees;
};

export const calculatePotentialLoss = (entryPrice, stopLossPrice, positionSize, makerFee) => {
  const grossLoss = (entryPrice - stopLossPrice) * positionSize;
  const totalFees = positionSize * stopLossPrice * (makerFee / 100);
  return grossLoss + totalFees;
};
