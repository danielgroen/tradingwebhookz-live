import { useEffect, useState } from 'react';
import { TextField, Typography, Chip, Button, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { OrderButton, OrderFormCaption, OrderFormFooter, OrderFormOrders } from '@components/index';
import { SIDE } from '@constants/index';
import { OrderState, ApiState } from '@states/index';
import { inputLeft, inputRight, inputBase } from '@utils/index';

export const OrderForm = () => {
  const {
    stopLoss,
    setStopLoss,
    takeProfit,
    setTakeProfit,
    price,
    setPrice,
    side,
    setSide,
    setRiskReward,
    qty,
    clearOrder,
    setQty,
    localLeverage: appLeverage,
    setLocalLeverage,
    orderPercent,
    setOrderPercent,
  } = OrderState();

  const [localStopLoss, setLocalStopLoss] = useState(stopLoss);
  const [localTakeProfit, setLocalTakeProfit] = useState(takeProfit);
  const [localPrice, setLocalPrice] = useState(price);
  const [localQty, setLocalQty] = useState(qty);
  const [localLeverage, setLocalLeverageState] = useState(appLeverage);

  const [accountBalance, setAccountBalance] = useState<{ free: number; total: number; used: number }>({
    free: 0,
    total: 0,
    used: 0,
  });
  const { primaryPair, counterAsset } = ApiState();

  useEffect(() => {
    setLocalStopLoss(stopLoss);
    setLocalTakeProfit(takeProfit);
    setLocalPrice(price);
    setLocalQty(qty);
    setLocalLeverageState(appLeverage);
  }, [stopLoss, takeProfit, price, qty, appLeverage]);

  useEffect(() => {
    if (stopLoss === '' || takeProfit === '' || !+price) {
      clearOrder();
    } else if (price && (+stopLoss > +price || +takeProfit < +price)) setSide(SIDE.SELL);
    else if (price && (+stopLoss < +price || +takeProfit > +price)) setSide(SIDE.BUY);
  }, [stopLoss, takeProfit, price]);

  return (
    <>
      <div>
        <Typography variant="h6" sx={{ mb: 2 }} className="block">
          Place order
          {side && (
            <Chip
              sx={{ ml: 1, opacity: 0.9 }}
              color={side === SIDE.BUY ? 'success' : 'error'}
              size="small"
              label={side === SIDE.BUY ? 'Long' : 'Short'}
            />
          )}
        </Typography>
        <TextField
          {...inputBase}
          value={(+(parseFloat(localQty) * parseFloat(localPrice)).toFixed(2) || ' ').toLocaleString('en-US')}
          disabled
          onChange={(e) => setLocalQty(e.target.value)}
          onBlur={() => setQty(localQty)}
          label={`Order in ${counterAsset}`}
          InputProps={{ endAdornment: counterAsset }}
        />
        <TextField
          {...inputBase}
          value={(+parseFloat(localQty) || ' ').toLocaleString('en-US')}
          onChange={(e) => setLocalQty(e.target.value?.replace(/,/g, ''))}
          onBlur={() => setQty(localQty)}
          label="Order by qty"
          InputProps={{ endAdornment: primaryPair }}
        />
        <ToggleButtonGroup
          fullWidth
          color="primary"
          value={orderPercent}
          size="small"
          exclusive
          sx={{ mb: 2, display: 'flex', height: '18px', '*': { fontSize: 10 } }}
        >
          {[10, 25, 50, 75, 100].map((percent) => (
            <ToggleButton disableRipple key={percent} value={percent} onClick={() => setOrderPercent(percent)}>
              {percent}%
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <TextField
          {...inputLeft}
          onChange={(e) => setLocalLeverageState(e.target.value)}
          onBlur={() => setLocalLeverage(localLeverage)}
          value={localLeverage || ' '}
          label="Leverage"
          InputProps={{ endAdornment: '𝘹' }}
        />
        <TextField
          {...inputBase}
          value={(+parseFloat(localPrice).toFixed(2) || ' ').toLocaleString('en-US')}
          onChange={(e) => setLocalPrice(e.target.value?.replace(/,/g, ''))}
          onBlur={() => setPrice(localPrice)}
          sx={{ mb: 2 }}
          label="Order Price"
          InputProps={{ endAdornment: `${counterAsset}` }}
        />
        <TextField
          {...inputLeft}
          color="error"
          value={(+parseFloat(localStopLoss).toFixed(2) || ' ').toLocaleString('en-US')}
          label="Stop Loss"
          onChange={(e) => setLocalStopLoss(e.target.value?.replace(/,/g, ''))}
          onBlur={(e) => {
            setStopLoss(e.target.value?.replace(/,/g, ''));
          }}
          focused
        />
        <TextField
          {...inputRight}
          value={(+parseFloat(localTakeProfit).toFixed(2) || ' ').toLocaleString('en-US')}
          onChange={(e) => setLocalTakeProfit(e.target.value?.replace(/,/g, ''))}
          onBlur={(e) => {
            setTakeProfit(e.target.value?.replace(/,/g, ''));
          }}
          label="Take Profit"
          color="success"
          focused
        />
        {/* <Test /> */}
        <OrderFormCaption accountBalance={accountBalance} />
      </div>

      <OrderFormOrders sx={{ marginTop: 'auto', py: 2 }} />
      {accountBalance?.free === 0 ? (
        <Button disabled variant="outlined" fullWidth>
          Insufficient {counterAsset}
        </Button>
      ) : (
        <OrderButton />
      )}

      <OrderFormFooter sx={{ mt: 1, mb: -1 }} accountBalance={accountBalance} setAccountBalance={setAccountBalance} />
    </>
  );
};
