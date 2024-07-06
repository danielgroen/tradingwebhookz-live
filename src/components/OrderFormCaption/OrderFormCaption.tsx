import { useEffect, useState, type FC } from 'react';
import { Typography } from '@mui/material';
import { OrderState, SettingsState, ApiState } from '@states/index';
import {
  calculatePositionSize,
  calculateLeverage,
  calculatePotentialProfit,
  calculatePotentialLoss,
  calculatePositionValue,
  stepSizeToFixed,
} from '@utils/index';

export const OrderFormCaption: FC<any> = ({ accountBalance }) => {
  const [potentialProfit, setPotentialProfit] = useState(0);
  const [potentialLoss, setPotentialLoss] = useState(0);

  const { risk } = SettingsState();
  const { stopLoss, takeProfit, price, riskReward, setQty, setLocalLeverage, orderPercent, watchOrderSubmit, side } =
    OrderState();
  const { counterAsset, apiMinOrderSize, apiMaxOrderSize, apiLeverageMax, apiLeverageStepSize, fees } = ApiState();
  const { maker, taker } = fees;

  useEffect(() => {
    setPotentialProfit(0);
    setPotentialLoss(0);
  }, [watchOrderSubmit]);

  useEffect(() => {
    if (!stopLoss || !takeProfit || !price || !risk || !accountBalance) return;

    const entryPrice = parseFloat(price);
    const stopLossPrice = parseFloat(stopLoss);
    const takeProfitPrice = parseFloat(takeProfit);
    const riskPercentage = parseFloat(risk) / 100;
    const riskAmount = accountBalance * riskPercentage;
    const tolerance = apiMinOrderSize as number; // Tolerance to adjust position size to match risk percentage

    // Initial position size calculation
    let positionSize = calculatePositionSize(riskAmount, entryPrice, stopLossPrice, maker, side);
    let orderValue = calculatePositionValue(positionSize, entryPrice);
    let leverage = calculateLeverage(orderValue, accountBalance, apiLeverageMax);
    let initialMargin = orderValue / leverage;
    let totalFees = orderValue * (maker / 100);
    let totalMarginRequirement = initialMargin + totalFees;

    let potentialLossPerUnit = Math.abs(entryPrice - stopLossPrice);
    let potentialLossTotal = potentialLossPerUnit * positionSize + totalFees;

    // Ensure total margin requirement does not exceed available balance
    if (totalMarginRequirement > accountBalance) {
      positionSize = ((accountBalance - totalFees) * leverage) / entryPrice;
      orderValue = calculatePositionValue(positionSize, entryPrice);
      initialMargin = orderValue / leverage;
      totalFees = orderValue * (maker / 100);
      totalMarginRequirement = initialMargin + totalFees;
    }

    // Adjust position size to ensure risk is capped at the specified percentage
    // IF THIS LOOPS CRASHES THE BROWSER, CHANGE BACK TO: TOLERANCE INSTEAD OF TOLERANCE / 2
    while (Math.abs(potentialLossTotal / accountBalance - riskPercentage) > tolerance / 2) {
      if (potentialLossTotal / accountBalance < riskPercentage + tolerance) {
        positionSize += Number(apiMinOrderSize); // Increase position size by apiMinOrderSize
      } else {
        positionSize -= Number(apiMinOrderSize); // Decrease position size by apiMinOrderSize
      }

      orderValue = calculatePositionValue(positionSize, entryPrice);
      potentialLossTotal = potentialLossPerUnit * positionSize + positionSize * stopLossPrice * (maker / 100);
      leverage = calculateLeverage(orderValue, accountBalance, apiLeverageMax);
    }

    const _potentialProfit = calculatePotentialProfit(takeProfitPrice, entryPrice, positionSize, maker, side);
    const _potentialLoss = calculatePotentialLoss(entryPrice, stopLossPrice, positionSize, maker, side);

    setQty(positionSize.toFixed(stepSizeToFixed(apiMinOrderSize as number)));
    setLocalLeverage(leverage.toFixed(stepSizeToFixed(apiLeverageStepSize as number)));
    setPotentialProfit(Number(_potentialProfit.toFixed(2)));
    setPotentialLoss(Number(_potentialLoss.toFixed(2)));
  }, [stopLoss, takeProfit, price, risk, accountBalance, orderPercent, side]);

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
