import { create } from 'zustand';

interface OrderStateProps {
  qty: string; // rename to amount
  setQty: (qty: string) => void;

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

  direction: 'long' | 'short' | null; // rename to side
  setDirection: (direction: 'long' | 'short' | null) => void;

  riskReward: string;
  setRiskReward: (riskReward: string) => void;
}

export const OrderState = create<OrderStateProps>((set) => ({
  qty: '',
  setQty: (qty) => set({ qty }),

  symbol: 'BTC/USDT',
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

  riskReward: '',
  setRiskReward: (riskReward) => set({ riskReward }),
}));
