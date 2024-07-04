import { useEffect, useState } from 'react';
import { TextField, Typography, Chip, Button, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { OrderButton, OrderFormCaption, OrderFormFooter, OrderFormActiveOrders } from '@components/index';
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
    setQty,
    localLeverage,
    setLocalLeverage,
    orderPercent,
    setOrderPercent,
  } = OrderState();

  const [accountBalance, setAccountBalance] = useState(null);
  const { primaryPair, counterAsset } = ApiState();

  useEffect(() => {
    if (stopLoss === '' && takeProfit === '') {
      setSide(null);
      setRiskReward('');
    } else if (+stopLoss > +price || +takeProfit < +price) setSide(SIDE.SELL);
    else if (+stopLoss < +price || +takeProfit > +price) setSide(SIDE.BUY);
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
          value={(+(parseFloat(qty) * parseFloat(price)).toFixed(2) || 0).toLocaleString('en-US')}
          disabled
          onChange={(e) => setQty(e.target.value)}
          label={`Order in ${counterAsset}`}
          InputProps={{ endAdornment: counterAsset }}
        />
        <TextField
          {...inputBase}
          value={qty || 0}
          // onChange={(e) => setTakeProfit(e.target.value)}
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
          onChange={(e) => setLocalLeverage(e.target.value)}
          value={localLeverage}
          label="Leverage"
          InputProps={{ endAdornment: '𝘹' }}
        />
        <TextField
          {...inputBase}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          sx={{ mb: 2 }}
          label="Order Price"
          InputProps={{ endAdornment: `${counterAsset}` }}
        />
        <TextField
          {...inputLeft}
          color="error"
          value={stopLoss}
          label="Stop Loss"
          onChange={(e) => setStopLoss(e.target.value)}
          focused
        />
        <TextField
          {...inputRight}
          value={takeProfit}
          onChange={(e) => setTakeProfit(e.target.value)}
          label="Take Profit"
          color="success"
          focused
        />
        <OrderFormCaption accountBalance={accountBalance} />
      </div>
      <OrderFormActiveOrders sx={{ marginTop: 'auto' }} />
      <OrderFormFooter sx={{ my: 2 }} accountBalance={accountBalance} setAccountBalance={setAccountBalance} />
      {accountBalance === 0 ? (
        <Button disabled variant="outlined" fullWidth>
          Insufficient {counterAsset}
        </Button>
      ) : (
        <OrderButton />
      )}
    </>
  );
};
