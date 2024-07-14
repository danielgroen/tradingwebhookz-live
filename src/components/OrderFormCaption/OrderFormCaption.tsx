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

    const orderSize = accountBalance * (orderPercent / 100);
    //
    const feesOpenPosition = maker / 100;

    const feesLoss = orderTypeStoploss === ORDER_TYPE.MARKET ? taker / 100 : maker / 100;
    // const totalFeesLoss = feesLoss + feesOpenPosition;

    const feesProfit = orderTypeTakeProfit === ORDER_TYPE.MARKET ? taker / 100 : maker / 100;
    // const totalFeesProfit = feesProfit + feesOpenPosition;

    const entryPrice = parseFloat(price);
    const stopLossPrice = parseFloat(stopLoss);
    const takeProfitPrice = parseFloat(takeProfit);
    const riskPercentage = parseFloat(risk) / 100;
    const riskAmount = orderSize * riskPercentage;
    const minOrderSize = parseFloat(apiMinOrderSize); // Minimum order size for position adjustments

    // Initial position size calculation
    let positionSize = calculatePositionSize(riskAmount, entryPrice, stopLossPrice, feesLoss, side);
    let orderValue = calculatePositionValue(positionSize, entryPrice);
    let leverage = calculateLeverage(orderValue, orderSize, apiLeverageMax);
    let initialMargin = orderValue / leverage;
    let totalFees = orderValue * feesLoss;
    let totalMarginRequirement = initialMargin + totalFees;

    let potentialLossPerUnit = Math.abs(entryPrice - stopLossPrice);
    let potentialLossTotal = potentialLossPerUnit * positionSize + totalFees;

    // Ensure total margin requirement does not exceed available balance
    if (totalMarginRequirement > orderSize) {
      positionSize = ((orderSize - totalFees) * leverage) / entryPrice;
      orderValue = calculatePositionValue(positionSize, entryPrice);
      initialMargin = orderValue / leverage;
      totalFees = orderValue * feesLoss;
      totalMarginRequirement = initialMargin + totalFees;
    }

    // Adjust position size to ensure risk is capped at the specified percentage
    while (Math.abs(potentialLossTotal / orderSize - riskPercentage) > 0.0001) {
      if (potentialLossTotal / orderSize < riskPercentage - 0.0001) {
        positionSize += minOrderSize / 10; // Increase position size by a smaller fraction of minOrderSize
      } else if (potentialLossTotal / orderSize > riskPercentage + 0.0001) {
        positionSize -= minOrderSize / 10; // Decrease position size by a smaller fraction of minOrderSize
      } else {
        break;
      }

      orderValue = calculatePositionValue(positionSize, entryPrice);
      totalFees = orderValue * feesLoss;
      potentialLossTotal = potentialLossPerUnit * positionSize + totalFees;
      leverage = calculateLeverage(orderValue, orderSize, apiLeverageMax);
    }

    const _potentialProfit = calculatePotentialProfit(takeProfitPrice, entryPrice, positionSize, feesProfit, side);
    const _potentialLoss = calculatePotentialLoss(entryPrice, stopLossPrice, positionSize, feesLoss, side);

    setQty(positionSize.toFixed(stepSizeToFixed(minOrderSize)));
    setLocalLeverage(leverage.toFixed(stepSizeToFixed(apiLeverageStepSize)));
    setPotentialProfit(Number(_potentialProfit.toFixed(2)));
    setPotentialLoss(Number(_potentialLoss.toFixed(2)));

    console.table({
      stopLoss,
      takeProfit,
      price,
      accountBalance,
      qty: positionSize.toFixed(stepSizeToFixed(minOrderSize)),
      positionSize,
      leverage,
      riskPercentage,
      '---fees---': '---',
      feesLoss,
      feesProfit,
      feesOpenPosition,
      totalFees,
      '---': '---',
      potentialLoss: _potentialLoss,
      'new balance if loss': (accountBalance - potentialLossTotal).toFixed(2),
      potentialProfit: _potentialProfit,
      'new balance if profit': (accountBalance + _potentialProfit).toFixed(2),
    });
  }, [stopLoss, takeProfit, price, risk, orderPercent, side, orderTypeStoploss, orderTypeTakeProfit]);

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
            <Typography variant="caption" color={potentialProfit > 0 ? 'success.light' : 'error'}>
              {potentialProfit.toFixed(2)}
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
            <Typography variant="caption" color={potentialProfit > 0 ? 'success.light' : 'error'}>
              {((potentialProfit.toFixed(2) / accountBalance) * 100).toFixed(2)}
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
