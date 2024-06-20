export const calculatePositionSize = (initialInvestment, risk, entryPrice, stopLossPrice) => {
  return (initialInvestment * risk) / Math.abs(entryPrice - stopLossPrice);
};

export const calculate = (positionSize, entryPrice) => {
  return positionSize * entryPrice;
};

export const calculateLeverage = (qty, accountBalance) => {
  if (qty <= accountBalance) return 1;
  return qty / accountBalance;
};

export const calculatePotentialProfit = (takeProfitPrice, entryPrice, positionSize) => {
  return (takeProfitPrice - entryPrice) * positionSize;
};

export const calculatePotentialLoss = (entryPrice, stopLossPrice, positionSize) => {
  return (entryPrice - stopLossPrice) * positionSize;
};
