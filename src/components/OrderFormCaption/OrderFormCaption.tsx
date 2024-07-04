import { useEffect, useState, type FC } from 'react';
import { Typography } from '@mui/material';
import { OrderState, SettingsState, ApiState } from '@states/index';
import {
  calculatePositionSize,
  calculate,
  calculateLeverage,
  calculatePotentialProfit,
  calculatePotentialLoss,
  stepSizeToFixed,
} from '@utils/index';

export const OrderFormCaption: FC<any> = ({ accountBalance }) => {
  const [potentialProfit, setPotentialProfit] = useState(0);
  const [potentialLoss, setPotentialLoss] = useState(0);

  const { orderTypeStoploss, orderTypeTakeProfit } = SettingsState();
  const { stopLoss, takeProfit, price, riskReward, setQty, setLocalLeverage } = OrderState();
  const { counterAsset, apiMinOrderSize, apiMaxOrderSize, apiLeverageMax, apiLeverageStepSize, fees } = ApiState();
  const { maker, taker } = fees;

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

    const qtyInUsdt = calculate(positionSize, entryPrice);
    const _leverage = calculateLeverage(qtyInUsdt, accountBalance);

    setQty(positionSize.toFixed(stepSizeToFixed(apiMinOrderSize as number)));
    setLocalLeverage(_leverage.toFixed(stepSizeToFixed(apiLeverageStepSize as number)));

    const _potentialProfit = calculatePotentialProfit(takeProfitPrice, entryPrice, positionSize);
    const _potentialLoss = calculatePotentialLoss(entryPrice, stopLossPrice, positionSize);

    setPotentialProfit(Number(_potentialProfit.toFixed(2)));
    setPotentialLoss(Number(_potentialLoss.toFixed(2)));
  }, [stopLoss, takeProfit, price, risk, accountBalance]);

  return (
    <>
      <div className="flex justify-between">
        {potentialLoss !== 0 && (
          <Typography variant="caption" sx={{ display: 'block' }}>
            L:{' '}
            <Typography variant="caption" color="error">
              {-Math.abs(potentialLoss).toFixed(2)}
            </Typography>{' '}
            {counterAsset}
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
            {counterAsset}
          </Typography>
        )}
      </div>

      <div className="flex justify-between">
        {potentialLoss !== 0 && (
          <Typography variant="caption" sx={{ display: 'block' }}>
            L:{' '}
            <Typography variant="caption" color="error">
              {((-Math.abs(potentialLoss).toFixed(2) / accountBalance) * 100).toFixed(2)}
            </Typography>{' '}
            %
          </Typography>
        )}
        {potentialProfit !== 0 && (
          <Typography variant="caption" sx={{ display: 'block' }}>
            P:{' '}
            <Typography variant="caption" color="success.light">
              {((Math.abs(potentialProfit).toFixed(2) / accountBalance) * 100).toFixed(2)}
            </Typography>{' '}
            %
            <Typography variant="caption" sx={{ opacity: 0, marginLeft: -1.5 }}>
              {counterAsset}
            </Typography>
          </Typography>
        )}
      </div>
    </>
  );
};
