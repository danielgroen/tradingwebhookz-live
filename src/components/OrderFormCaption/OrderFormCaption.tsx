import { useEffect, useState, type FC } from 'react';
import { Typography } from '@mui/material';
import { OrderState, SettingsState, MarketState } from '@states/index';
import {
  calculatePositionSize,
  calculate,
  calculateLeverage,
  calculatePotentialProfit,
  calculatePotentialLoss,
} from '@utils/index';

export const OrderFormCaption: FC<any> = ({ accountBalance }) => {
  const [potentialProfit, setPotentialProfit] = useState(0);
  const [potentialLoss, setPotentialLoss] = useState(0);
  const { stopLoss, takeProfit, price, riskReward, setQty, setLeverage } = OrderState();
  const { getCounterAsset } = MarketState();

  const { risk } = SettingsState();

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

  return (
    <div className="flex justify-between">
      {potentialLoss !== 0 && (
        <Typography variant="caption" sx={{ display: 'block' }}>
          L:{' '}
          <Typography variant="caption" color="error">
            {-Math.abs(potentialLoss).toFixed(2)}
          </Typography>{' '}
          {getCounterAsset()}
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
      {potentialProfit !== 0 && (
        <Typography variant="caption" sx={{ display: 'block' }}>
          P:{' '}
          <Typography variant="caption" color="success.light">
            {Math.abs(potentialProfit).toFixed(2)}
          </Typography>{' '}
          {getCounterAsset()}
        </Typography>
      )}
    </div>
  );
};
