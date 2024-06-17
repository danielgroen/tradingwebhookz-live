import { create } from 'zustand';

interface GlobalStateProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;

  isLoggingIn: boolean;
  setIsLoggingIn: (isLoggingIn: boolean) => void;

  isSettingsOpen: boolean;
  setIsSettingsOpen: (isSettingsOpen: boolean) => void;
}

export const GlobalState = create<GlobalStateProps>((set) => ({
  isLoggedIn: false,
  setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),

  isLoggingIn: false,
  setIsLoggingIn: (isLoggingIn) => set({ isLoggingIn }),

  isSettingsOpen: false,
  setIsSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
}));
