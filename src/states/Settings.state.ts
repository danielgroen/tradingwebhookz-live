import { create } from 'zustand';

interface SettingsStateProps {
  risk: number;
  setRisk: (risk: number) => void;

  collateral: string;
  setCollateral: (collateral: string) => void;

  autofill: boolean;
  setAutofill: (autofill: boolean) => void;
}

export const SettingsState = create<SettingsStateProps>((set) => ({
  risk: 1,
  setRisk: (risk) => set({ risk }),

  collateral: 'usdt',
  setCollateral: (collateral) => set({ collateral }),

  autofill: true,
  setAutofill: (autofill) => set({ autofill }),
}));
