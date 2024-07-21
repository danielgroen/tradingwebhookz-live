import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ORDER_TYPE, CATEGORY } from '@constants/index';

interface SettingsStateProps {
  risk: string;
  setRisk: (risk: string) => void;

  autoFill: boolean;
  toggleAutoFill: () => void;

  category: CATEGORY;
  setCategory: (category: CATEGORY) => void;

  autoRemoveDrawings: boolean;
  toggleAutoRemoveDrawings: () => void;

  orderbook: string;
  setOrderbook: (orderbook: string) => void;

  orderTypeStoploss: ORDER_TYPE;
  setOrderTypeStoploss: (orderTypeStoploss: ORDER_TYPE) => void;

  orderTypeTakeProfit: ORDER_TYPE;
  setOrderTypeTakeProfit: (orderTypeTakeProfit: ORDER_TYPE) => void;
}

export const SettingsState = create<SettingsStateProps>()(
  persist(
    (set, get) => ({
      risk: '1',
      setRisk: (risk) => set({ risk }),

      category: CATEGORY.LINEAR,
      setCategory: (category) => set({ category }),

      autoFill: true,
      toggleAutoFill: () => set({ autoFill: !get().autoFill }),

      autoRemoveDrawings: true,
      toggleAutoRemoveDrawings: () => set({ autoRemoveDrawings: !get().autoRemoveDrawings }),

      orderbook: '',
      setOrderbook: (orderbook) => set({ orderbook }),

      orderTypeStoploss: ORDER_TYPE.MARKET,
      setOrderTypeStoploss: (orderTypeStoploss) => set({ orderTypeStoploss }),

      orderTypeTakeProfit: ORDER_TYPE.LIMIT,
      setOrderTypeTakeProfit: (orderTypeTakeProfit) => set({ orderTypeTakeProfit }),
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        risk: state.risk,
        autoRemoveDrawings: state.autoRemoveDrawings,
        orderbook: state.orderbook,
        orderTypeStoploss: state.orderTypeStoploss,
        orderTypeTakeProfit: state.orderTypeTakeProfit,
      }),
    }
  )
);
