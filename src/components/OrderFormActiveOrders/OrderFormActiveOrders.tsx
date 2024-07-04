import { FC } from 'react';
import { Typography, Box, type BoxProps } from '@mui/material';

interface Props extends BoxProps {}

export const OrderFormActiveOrders: FC<Props> = ({ ...restBoxProps }) => {
  return (
    <Box
      className="flex items-center justify-center bg-slate-900 w-full rounded-md min-h-48 p-4 text-sky-900 relative"
      {...restBoxProps}
    >
      No active orders...
    </Box>
  );
};
