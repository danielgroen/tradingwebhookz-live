import { create } from 'zustand';

interface GlobalStateProps {
  isLoggingIn: boolean;
  setIsLoggingIn: (collateral: boolean) => void;

  isSettingsOpen: boolean;
  setIsSettingsOpen: (isSettingsOpen: boolean) => void;
}

export const GlobalState = create<GlobalStateProps>((set) => ({
  isLoggingIn: false,
  setIsLoggingIn: (isLoggingIn) => set({ isLoggingIn }),

  isSettingsOpen: false,
  setIsSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
}));
