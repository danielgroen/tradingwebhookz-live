import { type Dispatch, useState, useEffect, type FC, type SetStateAction } from 'react';
import { Typography, Box, type BoxProps } from '@mui/material';
import { ApiState } from '@states/index';
import { Bybit } from '@utils/index';

interface Props extends BoxProps {
  accountBalance: { free: number; total: number; used: number };
  setAccountBalance: Dispatch<SetStateAction<{ free: number; total: number; used: number }>>;
}

export const OrderFormFooter: FC<Props> = ({ accountBalance, setAccountBalance, ...restBoxProps }) => {
  const intervalTime = 10 * 1000;

  const { counterAsset, brokerInstance, startBalanceToday, setStartBalanceToday, startDate, setStartDate } = ApiState();
  const [computedPnlPercent, setComputedPnlPercent] = useState(0);

  useEffect(() => {
    if (!brokerInstance || !counterAsset) return;
    (async () => {
      await Bybit.getBalance({ counterAsset, brokerInstance }, setAccountBalance);
    })();
  }, []);

  useEffect(() => {
    setComputedPnlPercent(() => {
      if (!startBalanceToday || !accountBalance?.total) return 0;

      return ((accountBalance.total - startBalanceToday) / startBalanceToday) * 100;
    });
  }, [accountBalance, startBalanceToday]);

  useEffect(() => {
    if (accountBalance?.total === 0) return;

    if (!startDate) {
      setStartDate();
      setStartBalanceToday(accountBalance?.total);
    } else {
      const isToday = new Date().setHours(0, 0, 0, 0) === new Date(startDate).setHours(0, 0, 0, 0);
      if (!isToday) {
        setStartDate();
        setStartBalanceToday(accountBalance?.total);
      }
    }
  }, [accountBalance?.total, startDate]);

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
        {typeof accountBalance === 'object' && (
          <>
            <div className="flex justify-between text-xs gap-1">
              <div className="flex justify-between flex-col text-xs gap-1">
                <div>
                  Total:{' '}
                  <span style={{ color: '#66bb6a' }}>
                    {(+accountBalance?.total?.toFixed(2)).toLocaleString('en-US')} {counterAsset}
                  </span>
                </div>
                {accountBalance?.total !== accountBalance?.total && (
                  <div>
                    Free:{' '}
                    <span style={{ color: '#66bb6a' }}>
                      {(+accountBalance?.total?.toFixed(2)).toLocaleString('en-US')} {counterAsset}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-between flex-col text-xs gap-1 text-right">
                <div className="mr-0">PnL Today</div>
                <div>
                  <span
                    style={{ fontSize: 20, fontWeight: 100, color: computedPnlPercent >= 0 ? '#66bb6a' : '#f44336' }}
                  >
                    {computedPnlPercent.toFixed(2)}
                  </span>{' '}
                  %
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Box>
  );
};
