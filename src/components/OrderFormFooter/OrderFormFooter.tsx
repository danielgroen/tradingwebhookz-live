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

  const intervalTime = 10 * 1000;

  useEffect(() => {
    if (!brokerInstance || !counterAsset) return;
    (async () => {
      await Bybit.getBalance({ counterAsset, brokerInstance }, setAccountBalance);
    })();
  }, []);

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
          <div className="flex justify-end text-xs gap-1">
            <div>Free balance:</div>
            <div style={{ color: '#66bb6a' }}>
              {(+accountBalance?.toFixed(2)).toLocaleString('en-US')} {counterAsset}
            </div>
          </div>
        )}
      </div>
    </Box>
  );
};
