import { create } from 'zustand';
import { type SIDE } from '@constants/index';

interface OrderStateProps {
  qty: string;
  setQty: (qty: string) => void;

  price: string;
  setPrice: (price: string) => void;

  leverage: string;
  setLeverage: (leverage: string) => void;

  stopLoss: string;
  setStopLoss: (stopLoss: string) => void;

  takeProfit: string;
  setTakeProfit: (takeProfit: string) => void;

  side: SIDE | null;
  setSide: (side: SIDE | null) => void;

  riskReward: string;
  setRiskReward: (riskReward: string) => void;
}

export const OrderState = create<OrderStateProps>((set) => ({
  qty: '',
  setQty: (qty) => set({ qty }),

  price: '',
  setPrice: (price) => set({ price }),

  leverage: '',
  setLeverage: (leverage) => set({ leverage }),

  stopLoss: '',
  setStopLoss: (stopLoss) => set({ stopLoss }),

  takeProfit: '',
  setTakeProfit: (takeProfit) => set({ takeProfit }),

  side: null,
  setSide: (side) => set({ side }),

  riskReward: '',
  setRiskReward: (riskReward) => set({ riskReward }),
}));
