import { create } from 'zustand';
import { type SIDE } from '@constants/index';

interface OrderStateProps {
  qty: string;
  setQty: (qty: string) => void;

  orderPercent: number;
  setOrderPercent: (orderPercent: number) => void;

  price: string;
  setPrice: (price: string) => void;

  submittedOrderId: null | string;
  setSubmittedOrderId: (submittedOrderId) => void;

  localLeverage: string;
  setLocalLeverage: (localLeverage: string) => void;

  stopLoss: string;
  setStopLoss: (stopLoss: string) => void;

  takeProfit: string;
  setTakeProfit: (takeProfit: string) => void;

  side: SIDE | null;
  setSide: (side: SIDE | null) => void;

  riskReward: string;
  setRiskReward: (riskReward: string) => void;

  isOrderFilled: () => boolean;
  clearOrder: () => void;

  openOrders: any[];
  setOpenOrders: (openOrders: any[]) => void;

  openPositions: any[];
  setOpenPositions: (openPositions: any[]) => void;
}

export const OrderState = create<OrderStateProps>((set, get) => ({
  qty: '',
  setQty: (qty) => set({ qty }),

  orderPercent: 100,
  setOrderPercent: (orderPercent) => set({ orderPercent }),

  price: '',
  setPrice: (price) => set({ price }),

  submittedOrderId: null,
  setSubmittedOrderId: (submittedOrderId) => set({ submittedOrderId }),

  localLeverage: '',
  setLocalLeverage: (localLeverage) => set({ localLeverage }),

  stopLoss: '',
  setStopLoss: (stopLoss) => set({ stopLoss }),

  takeProfit: '',
  setTakeProfit: (takeProfit) => set({ takeProfit }),

  side: null,
  setSide: (side) => set({ side }),

  riskReward: '',
  setRiskReward: (riskReward) => set({ riskReward }),

  isOrderFilled: () => {
    const { qty, price, localLeverage, stopLoss, takeProfit, side } = get();
    return !!(+qty && +price && +localLeverage && +stopLoss && +takeProfit && side);
  },

  openOrders: [],
  setOpenOrders: (openOrders) => set({ openOrders }),

  openPositions: [],
  setOpenPositions: (openPositions) => set({ openPositions }),

  clearOrder: () =>
    set({
      qty: '',
      price: '',
      localLeverage: '',
      stopLoss: '',
      takeProfit: '',
      side: null,
      riskReward: '',
    }),
}));
