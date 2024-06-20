import { type Dispatch, useEffect, type FC, type SetStateAction } from 'react';
import { Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { BrokerState, MarketState } from '@states/index';

interface Props {
  accountBalance: number | null;
  setAccountBalance: Dispatch<SetStateAction<null>>;
}

export const OrderFormFooter: FC<Props> = ({ accountBalance, setAccountBalance }) => {
  const { getCounterAsset } = MarketState();

  const { brokerInstance } = BrokerState();

  const intervalTime = 3000;

  useEffect(() => {
    if (!brokerInstance || !getCounterAsset()) return;

    const interval = setInterval(async () => {
      try {
        const getBalance = await brokerInstance?.fetchBalance();
        setAccountBalance(getBalance[getCounterAsset()]?.free);
      } catch (error) {
        enqueueSnackbar(`${error}`, {
          variant: 'error',
        });
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [accountBalance, getCounterAsset()]);

  return (
    <div style={{ marginBottom: 8, marginTop: 'auto' }}>
      <div>
        {accountBalance && (
          <>
            Balance: {(+accountBalance)?.toFixed(2)} {getCounterAsset()}
          </>
        )}
      </div>
      <Typography>PNL of current trade: $ 0.00</Typography>
    </div>
  );
};
