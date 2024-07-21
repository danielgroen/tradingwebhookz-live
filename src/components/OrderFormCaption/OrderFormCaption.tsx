import { useEffect, useState, type FC } from 'react';
import { Typography } from '@mui/material';
import { OrderState, SettingsState, ApiState } from '@states/index';
import { ORDER_TYPE, SIDE } from '@constants/index';
import { stepSizeToFixed } from '@utils/index';

export const OrderFormCaption: FC<any> = ({ accountBalance }) => {
  const [potentialProfit, setPotentialProfit] = useState(0);
  const [potentialLoss, setPotentialLoss] = useState(0);

  const { risk, orderTypeStoploss, orderTypeTakeProfit } = SettingsState();
  const { stopLoss, takeProfit, price, riskReward, setQty, setLocalLeverage, orderPercent, side } = OrderState();
  const { counterAsset, apiMinOrderSize, apiMaxOrderSize, apiLeverageMax, apiLeverageStepSize, fees } = ApiState();
  const { maker, taker } = fees as { maker: number; taker: number };

  useEffect(() => {
    if (side) return;
    setPotentialLoss(0);
    setPotentialProfit(0);
  }, [side]);

  useEffect(() => {
    if (
      !price ||
      !stopLoss ||
      !takeProfit ||
      !accountBalance ||
      !risk ||
      !apiMinOrderSize ||
      !apiLeverageStepSize ||
      !side
    )
      return;

    const minimalOrderSize = parseFloat(apiMinOrderSize);
    const entryPrice = parseFloat(price);
    const sl = parseFloat(stopLoss);
    const tp = parseFloat(takeProfit);
    const orderSize = accountBalance * (orderPercent / 100);

    const feesOpen = maker / 100;
    const feesLoss = orderTypeStoploss === ORDER_TYPE.MARKET ? taker / 100 : maker / 100;
    const feesProfit = orderTypeTakeProfit === ORDER_TYPE.MARKET ? taker / 100 : maker / 100;

    const riskAmount = orderSize * ((parseFloat(risk) + 0.07) / 100);
    const lossPerUnit = entryPrice - sl;

    // Adjust the position size to ensure that the total loss does not exceed the risk amount
    let positionSizeWithFees = riskAmount / (Math.abs(lossPerUnit) + feesOpen * entryPrice + feesLoss * entryPrice);
    positionSizeWithFees = Math.floor(positionSizeWithFees / minimalOrderSize) * minimalOrderSize;

    const entryFeesInUSDT = positionSizeWithFees * feesOpen * entryPrice;
    // console.log(`Entry Fees in USDT: ${entryFeesInUSDT.toFixed(4)}`);

    setQty(`${!!positionSizeWithFees ? positionSizeWithFees : minimalOrderSize}`);

    const potentialProfit =
      side === SIDE.BUY
        ? (tp - entryPrice) * positionSizeWithFees - feesProfit * positionSizeWithFees * tp - entryFeesInUSDT
        : (entryPrice - tp) * positionSizeWithFees - feesProfit * positionSizeWithFees * tp - entryFeesInUSDT;

    const potentialLoss =
      side === SIDE.BUY
        ? (entryPrice - sl) * positionSizeWithFees + feesLoss * positionSizeWithFees * sl + entryFeesInUSDT
        : (sl - entryPrice) * positionSizeWithFees + feesLoss * positionSizeWithFees * sl + entryFeesInUSDT;

    setPotentialProfit(potentialProfit);
    setPotentialLoss(potentialLoss);

    const positionValue = positionSizeWithFees * entryPrice;
    const requiredLeverage = positionValue / orderSize + 1;
    setLocalLeverage(requiredLeverage.toFixed(stepSizeToFixed(apiLeverageStepSize)));
  }, [
    accountBalance,
    stopLoss,
    takeProfit,
    price,
    risk,
    orderPercent,
    side,
    maker,
    taker,
    orderTypeStoploss,
    orderTypeTakeProfit,
    apiMinOrderSize,
  ]);

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
              1:{parseFloat(riskReward).toFixed(1).replace('.0', '')}
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
              {((+potentialProfit.toFixed(2) / accountBalance) * 100).toFixed(2)}
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
