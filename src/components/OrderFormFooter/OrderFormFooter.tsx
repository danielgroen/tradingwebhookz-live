import { type Dispatch, useEffect, type FC, type SetStateAction } from 'react';
import { Typography, Box, type BoxProps } from '@mui/material';
import { ApiState } from '@states/index';
import { Bybit } from '@utils/index';

interface Props extends BoxProps {
  accountBalance: number | null;
  setAccountBalance: Dispatch<SetStateAction<null>>;
}

export const OrderFormFooter: FC<Props> = ({ accountBalance, setAccountBalance, ...restBoxProps }) => {
  const { counterAsset, brokerInstance } = ApiState();

  const intervalTime = 3000;

  useEffect(() => {
    if (!brokerInstance || !counterAsset) return;

    const interval = setInterval(async () => {
      await Bybit.getBalance({ counterAsset, brokerInstance }, setAccountBalance);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [accountBalance, counterAsset]);

  return (
    <Box {...restBoxProps}>
      <div>
        {accountBalance && (
          <>
            Balance: {(+accountBalance)?.toFixed(2)} {counterAsset}
          </>
        )}
      </div>
      <Typography>PNL of current trade: $ 0.00</Typography>
    </Box>
  );
};
