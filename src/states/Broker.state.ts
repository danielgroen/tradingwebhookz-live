import { type bybit } from 'ccxt';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BrokerStateProps {
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

export const BrokerState = create<BrokerStateProps>()(
  persist(
    (set) => ({
      brokerInstance: null,
      setBrokerInstance: (brokerInstance) => set({ brokerInstance }),

      apiKey: '2CsRgnKhTpvOuol7EE',
      // apiKey: '',
      setApiKey: (apiKey) => set({ apiKey }),

      secret: 'TLAzJpunuJ7QRcyhhdI9xQR7snEI4N4RfR2M',
      // secret: '',
      setSecret: (secret) => set({ secret }),

      isTestnet: true,
      setIsTestnet: (isTestnet) => set({ isTestnet }),

      rememberMe: true,
      setRememberMe: (rememberMe) => set({ rememberMe }),

      clearStore: () => set({ brokerInstance: null, apiKey: '', secret: '', isTestnet: false, rememberMe: false }),
    }),
    {
      name: 'broker-storage',
      partialize: (state) =>
        state.rememberMe ? { apiKey: state.apiKey, secret: state.secret, isTestnet: state.isTestnet } : {},
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
      }),
    }
  )
);
