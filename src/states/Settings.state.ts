import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ORDER_TYPE } from '@constants/index';

interface SettingsStateProps {
  risk: string;
  setRisk: (risk: string) => void;

  autofill: boolean;
  setAutofill: (autofill: boolean) => void;

  orderbook: string;
  setOrderbook: (orderbook: string) => void;

  orderTypeStoploss: ORDER_TYPE;
  setOrderTypeStoploss: (orderTypeStoploss: ORDER_TYPE) => void;

  orderTypeTakeProfit: ORDER_TYPE;
  setOrderTypeTakeProfit: (orderTypeTakeProfit: ORDER_TYPE) => void;
}

export const SettingsState = create<SettingsStateProps>()(
  persist(
    (set) => ({
      risk: '1',
      setRisk: (risk) => set({ risk }),

      autofill: true,
      setAutofill: (autofill) => set({ autofill }),

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
        orderbook: state.orderbook,
        orderTypeStoploss: state.orderTypeStoploss,
        orderTypeTakeProfit: state.orderTypeTakeProfit,
      }),
    }
  )
);
