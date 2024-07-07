import { useEffect, useState, type FC } from 'react';
import { Typography } from '@mui/material';
import { OrderState, SettingsState, ApiState } from '@states/index';
import { ORDER_TYPE } from '@constants/index';

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

  const { risk, orderTypeStoploss, orderTypeTakeProfit } = SettingsState();
  const { stopLoss, takeProfit, price, riskReward, setQty, setLocalLeverage, orderPercent, watchOrderSubmit, side } =
    OrderState();
  const { counterAsset, apiMinOrderSize, apiMaxOrderSize, apiLeverageMax, apiLeverageStepSize, fees } = ApiState();
  const { maker, taker } = fees as { maker: number; taker: number };

  useEffect(() => {
    setPotentialProfit(0);
    setPotentialLoss(0);
  }, [watchOrderSubmit]);

  useEffect(() => {
    if (!stopLoss || !takeProfit || !price || !risk || !accountBalance) return;

    const feesProfit = orderTypeTakeProfit === ORDER_TYPE.MARKET ? taker / 100 : maker / 100;
    const feesLoss = orderTypeStoploss === ORDER_TYPE.MARKET ? taker / 100 : maker / 100;
    const orderFees = maker / 100;

    const entryPrice = parseFloat(price);
    const stopLossPrice = parseFloat(stopLoss);
    const takeProfitPrice = parseFloat(takeProfit);
    const riskPercentage = parseFloat(risk) / 100;
    const riskAmount = accountBalance * riskPercentage;
    const minOrderSize = parseFloat(apiMinOrderSize); // Minimum order size for position adjustments

    // Initial position size calculation
    let positionSize = calculatePositionSize(riskAmount, entryPrice, stopLossPrice, orderFees, side);
    let orderValue = calculatePositionValue(positionSize, entryPrice);
    let leverage = calculateLeverage(orderValue, accountBalance, apiLeverageMax);
    let initialMargin = orderValue / leverage;
    let totalFees = orderValue * orderFees;
    let totalMarginRequirement = initialMargin + totalFees;

    let potentialLossPerUnit = Math.abs(entryPrice - stopLossPrice);
    let potentialLossTotal = potentialLossPerUnit * positionSize + totalFees;

    // Ensure total margin requirement does not exceed available balance
    if (totalMarginRequirement > accountBalance) {
      positionSize = ((accountBalance - totalFees) * leverage) / entryPrice;
      orderValue = calculatePositionValue(positionSize, entryPrice);
      initialMargin = orderValue / leverage;
      totalFees = orderValue * orderFees;
      totalMarginRequirement = initialMargin + totalFees;
    }

    // Adjust position size to ensure risk is capped at the specified percentage
    while (Math.abs(potentialLossTotal / accountBalance - riskPercentage) > 0.0001) {
      if (potentialLossTotal / accountBalance < riskPercentage - 0.0001) {
        positionSize += minOrderSize / 10; // Increase position size by a smaller fraction of minOrderSize
      } else if (potentialLossTotal / accountBalance > riskPercentage + 0.0001) {
        positionSize -= minOrderSize / 10; // Decrease position size by a smaller fraction of minOrderSize
      } else {
        break;
      }

      orderValue = calculatePositionValue(positionSize, entryPrice);
      totalFees = orderValue * orderFees;
      potentialLossTotal = potentialLossPerUnit * positionSize + totalFees;
      leverage = calculateLeverage(orderValue, accountBalance, apiLeverageMax);
    }

    const _potentialProfit = calculatePotentialProfit(takeProfitPrice, entryPrice, positionSize, feesProfit, side);
    const _potentialLoss = calculatePotentialLoss(entryPrice, stopLossPrice, positionSize, feesLoss, side);

    setQty(positionSize.toFixed(stepSizeToFixed(minOrderSize)));
    setLocalLeverage(leverage.toFixed(stepSizeToFixed(apiLeverageStepSize)));
    setPotentialProfit(Number(_potentialProfit.toFixed(2)));
    setPotentialLoss(Number(_potentialLoss.toFixed(2)));
  }, [stopLoss, takeProfit, price, risk, accountBalance, orderPercent, side, orderTypeStoploss, orderTypeTakeProfit]);

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
