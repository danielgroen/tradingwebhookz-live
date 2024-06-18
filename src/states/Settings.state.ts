import { create } from 'zustand';

interface SettingsStateProps {
  risk: string;
  setRisk: (risk: string) => void;

  collateral: string;
  setCollateral: (collateral: string) => void;

  autofill: boolean;
  setAutofill: (autofill: boolean) => void;

  fees: string;
  setFees: (fees: string) => void;
}

export const SettingsState = create<SettingsStateProps>((set) => ({
  risk: '1',
  setRisk: (risk) => set({ risk }),

  fees: '0.02',
  setFees: (fees) => set({ fees }),

  collateral: 'USDT',
  setCollateral: (collateral) => set({ collateral }),

  autofill: true,
  setAutofill: (autofill) => set({ autofill }),
}));
