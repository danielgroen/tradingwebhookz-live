import { useEffect, useState } from 'react';
import { TextField, Typography, Chip, Button } from '@mui/material';
import { OrderButton, OrderFormCaption, OrderFormFooter } from '@components/index';
import { SIDE } from '@constants/index';
import { OrderState, MarketState } from '@states/index';
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
    leverage,
    setLeverage,
  } = OrderState();

  const [accountBalance, setAccountBalance] = useState(null);
  const { getPrimaryPair, getCounterAsset } = MarketState();

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
              label={side}
            />
          )}
        </Typography>

        <TextField
          {...inputBase}
          value={qty || 0}
          onChange={(e) => setQty(e.target.value)}
          label={`Order in ${getCounterAsset()}`}
          InputProps={{ endAdornment: getCounterAsset() }}
        />

        <TextField
          {...inputBase}
          value={(parseFloat(qty) / parseFloat(price) || 0).toFixed(3)}
          // onChange={(e) => setTakeProfit(e.target.value)}
          label="Order by qty"
          InputProps={{ endAdornment: getPrimaryPair() }}
        />

        <div className="flex justify-between mb-4 opacity-40">
          <Typography
            variant="caption"
            sx={{ display: 'block', border: '1px solid', width: '25%', textAlign: 'center' }}
          >
            25%
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: 'block', border: '1px solid', width: '25%', textAlign: 'center' }}
          >
            50%
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: 'block', border: '1px solid', width: '25%', textAlign: 'center' }}
          >
            75%
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: 'block', border: '1px solid', width: '25%', textAlign: 'center' }}
          >
            100%
          </Typography>
        </div>

        <TextField {...inputLeft} disabled value={getPrimaryPair()} label="Symbol" />

        <TextField {...inputRight} onChange={(e) => setLeverage(e.target.value)} value={leverage} label="Leverage" />

        <TextField
          {...inputBase}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          sx={{ mb: 2 }}
          label="Order Price"
          InputProps={{ endAdornment: `${getCounterAsset()}` }}
        />

        <TextField
          {...inputLeft}
          color="error"
          value={stopLoss}
          label="SL"
          onChange={(e) => setStopLoss(e.target.value)}
          focused
        />

        <TextField
          {...inputRight}
          value={takeProfit}
          onChange={(e) => setTakeProfit(e.target.value)}
          label="TP"
          color="success"
          focused
        />

        <OrderFormCaption accountBalance={accountBalance} />
      </div>

      <OrderFormFooter accountBalance={accountBalance} setAccountBalance={setAccountBalance} />

      {accountBalance === 0 ? (
        <Button disabled variant="outlined" fullWidth>
          Insufficient {getCounterAsset()}
        </Button>
      ) : (
        <OrderButton />
      )}
    </>
  );
};
