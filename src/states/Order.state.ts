import { create } from 'zustand';

interface OrderStateProps {
  amount: number | null;
  setAmount: (amount: number | null) => void;

  symbol: string;
  setSymbol: (symbol: string) => void;

  price: number | null;
  setPrice: (price: number | null) => void;

  leverage: number | null;
  setLeverage: (leverage: number | null) => void;

  stoploss: number | null;
  setStoploss: (stoploss: number | null) => void;

  takeProfit: number | null;
  setTakeProfit: (takeProfit: number | null) => void;
}

export const OrderState = create<OrderStateProps>((set) => ({
  amount: null,
  setAmount: (amount) => set({ amount }),

  symbol: '',
  setSymbol: (symbol) => set({ symbol }),

  price: null,
  setPrice: (price) => set({ price }),

  leverage: null,
  setLeverage: (leverage) => set({ leverage }),

  stoploss: null,
  setStoploss: (stoploss) => set({ stoploss }),

  takeProfit: null,
  setTakeProfit: (takeProfit) => set({ takeProfit }),
}));
