import { type bybit } from 'ccxt';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStateProps {
  brokerInstance: bybit | null;
  setBrokerInstance: (brokerInstance: bybit | null) => void;

  apiKey: string;
  setApiKey: (apiKey: string) => void;

  secret: string;
  setSecret: (secret: string) => void;

  isTestnet: boolean;
  setIsTestnet: (isTestnet: boolean) => void;

  rememberMe: boolean;
  setRememberMe: (rememberMe: boolean) => void;

  clearStore: () => void;
}

export const AuthState = create<AuthStateProps>()(
  persist(
    (set) => ({
      brokerInstance: null,
      setBrokerInstance: (brokerInstance) => set({ brokerInstance }),

      apiKey: '2CsRgnKhTpvOuol7EE',
      // apiKey: import.meta.env.DEV ? '2CsRgnKhTpvOuol7EE' : '',
      setApiKey: (apiKey) => set({ apiKey }),

      secret: 'TLAzJpunuJ7QRcyhhdI9xQR7snEI4N4RfR2M',
      // secret: import.meta.env.DEV ? 'TLAzJpunuJ7QRcyhhdI9xQR7snEI4N4RfR2M' : '',
      setSecret: (secret) => set({ secret }),

      isTestnet: true,
      setIsTestnet: (isTestnet) => set({ isTestnet }),

      rememberMe: true,
      setRememberMe: (rememberMe) => set({ rememberMe }),

      clearStore: () => set({ brokerInstance: null, apiKey: '', secret: '', isTestnet: false, rememberMe: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) =>
        state.rememberMe ? { apiKey: state.apiKey, secret: state.secret, isTestnet: state.isTestnet } : {},
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
      }),
    }
  )
);
