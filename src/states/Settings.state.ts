import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStateProps {
  risk: string;
  setRisk: (risk: string) => void;

  collateral: string;
  setCollateral: (collateral: string) => void;

  autofill: boolean;
  setAutofill: (autofill: boolean) => void;

  fees: string;
  setFees: (fees: string) => void;

  orderbook: string;
  setOrderbook: (orderbook: string) => void;
}

export const SettingsState = create<SettingsStateProps>()(
  persist(
    (set) => ({
      risk: '1',
      setRisk: (risk) => set({ risk }),

      fees: '0.02',
      setFees: (fees) => set({ fees }),

      collateral: 'USDT',
      setCollateral: (collateral) => set({ collateral }),

      autofill: true,
      setAutofill: (autofill) => set({ autofill }),

      orderbook: '',
      setOrderbook: (orderbook) => set({ orderbook }),
    }),
    {
      name: 'settings-storage', // name of the item in storage
      partialize: (state) => ({ orderbook: state.orderbook }), // only persist orderbook
    }
  )
);
