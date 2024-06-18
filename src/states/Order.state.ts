import { create } from 'zustand';

interface OrderStateProps {
  amount: string;
  setAmount: (amount: string) => void;

  symbol: string;
  setSymbol: (symbol: string) => void;

  price: string;
  setPrice: (price: string) => void;

  leverage: string;
  setLeverage: (leverage: string) => void;

  stopLoss: string;
  setStopLoss: (stopLoss: string) => void;

  takeProfit: string;
  setTakeProfit: (takeProfit: string) => void;

  direction: 'long' | 'short' | null;
  setDirection: (direction: 'long' | 'short' | null) => void;
}

export const OrderState = create<OrderStateProps>((set) => ({
  amount: '',
  setAmount: (amount) => set({ amount }),

  symbol: '',
  setSymbol: (symbol) => set({ symbol }),

  price: '',
  setPrice: (price) => set({ price }),

  leverage: '',
  setLeverage: (leverage) => set({ leverage }),

  stopLoss: '',
  setStopLoss: (stopLoss) => set({ stopLoss }),

  takeProfit: '',
  setTakeProfit: (takeProfit) => set({ takeProfit }),

  direction: null,
  setDirection: (direction) => set({ direction }),
}));
