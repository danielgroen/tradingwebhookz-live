import { type Dispatch, useEffect, type FC, type SetStateAction } from 'react';
import { Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { AuthState, ApiState } from '@states/index';

interface Props {
  accountBalance: number | null;
  setAccountBalance: Dispatch<SetStateAction<null>>;
}

export const OrderFormFooter: FC<Props> = ({ accountBalance, setAccountBalance }) => {
  const { counterAsset } = ApiState();

  const { brokerInstance } = AuthState();

  const intervalTime = 3000;

  useEffect(() => {
    console.log(brokerInstance, counterAsset);

    if (!brokerInstance || !counterAsset) return;

    const interval = setInterval(async () => {
      try {
        const getBalance = await brokerInstance?.fetchBalance();
        console.log(getBalance);

        setAccountBalance(getBalance[counterAsset]?.free);
      } catch (error) {
        enqueueSnackbar(`${error}`, {
          variant: 'error',
        });
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [accountBalance, counterAsset]);

  return (
    <div style={{ marginBottom: 8, marginTop: 'auto' }}>
      <div>
        {accountBalance && (
          <>
            Balance: {(+accountBalance)?.toFixed(2)} {counterAsset}
          </>
        )}
      </div>
      <Typography>PNL of current trade: $ 0.00</Typography>
    </div>
  );
};
