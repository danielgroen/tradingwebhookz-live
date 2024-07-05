import { useEffect, useState, type FC } from 'react';
import { Typography } from '@mui/material';
import { OrderState, SettingsState, ApiState } from '@states/index';
import {
  calculatePositionSize,
  calculateLeverage,
  calculatePotentialProfit,
  calculatePotentialLoss,
  calculate,
  stepSizeToFixed,
} from '@utils/index';

export const OrderFormCaption: FC<any> = ({ accountBalance }) => {
  const [potentialProfit, setPotentialProfit] = useState(0);
  const [potentialLoss, setPotentialLoss] = useState(0);

  const { risk } = SettingsState();
  const { stopLoss, takeProfit, price, riskReward, setQty, setLocalLeverage } = OrderState();
  const { counterAsset, apiMinOrderSize, apiMaxOrderSize, apiLeverageMax, apiLeverageStepSize, fees } = ApiState();
  const { maker, taker } = fees;

  // Calculate position size, leverage, potential profit, and potential loss
  useEffect(() => {
    if (stopLoss === '' || takeProfit === '' || price === '' || risk === '' || !accountBalance) return;

    const entryPrice = parseFloat(price);
    const stopLossPrice = parseFloat(stopLoss);
    const takeProfitPrice = parseFloat(takeProfit);
    const initialInvestment = accountBalance;
    const riskPercentage = parseFloat(risk) / 100;

    let positionSize = calculatePositionSize(initialInvestment, riskPercentage, entryPrice, stopLossPrice, maker);
    let orderValue = calculate(positionSize, entryPrice);
    let leverage = calculateLeverage(orderValue, accountBalance, apiLeverageMax);
    let initialMargin = orderValue / leverage;
    let totalFees = orderValue * (maker / 100);

    let totalMarginRequirement = initialMargin + totalFees;
    // todo: improve calculations
    const feeReserve = accountBalance * 0.01; // 1% of account balance reserved for fees
    const availableBalanceForTrading = accountBalance - feeReserve;

    if (totalMarginRequirement > availableBalanceForTrading) {
      positionSize = ((availableBalanceForTrading - totalFees) * leverage) / entryPrice;
      orderValue = calculate(positionSize, entryPrice);
      initialMargin = orderValue / leverage;
      totalFees = orderValue * (maker / 100);
      totalMarginRequirement = initialMargin + totalFees;
    }

    const _potentialProfit = calculatePotentialProfit(takeProfitPrice, entryPrice, positionSize, maker);
    const _potentialLoss = calculatePotentialLoss(entryPrice, stopLossPrice, positionSize, maker);

    setQty(positionSize.toFixed(stepSizeToFixed(apiMinOrderSize as number)));
    setLocalLeverage(leverage.toFixed(stepSizeToFixed(apiLeverageStepSize as number)));
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
