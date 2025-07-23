import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthStateProps {
  apiKey: string;
  setApiKey: (apiKey: string) => void;

  secret: string;
  setSecret: (secret: string) => void;

  isDemoTrade: boolean;
  setIsDemoTrade: (isDemoTrade: boolean) => void;

  rememberMe: boolean;
  setRememberMe: (rememberMe: boolean) => void;

  clearStore: () => void;
}

export const AuthState = create<AuthStateProps>()(
  persist(
    (set) => ({
      apiKey: import.meta.env.DEV ? 'ANC6CM93TGTsrrLUoT' : '',
      setApiKey: (apiKey) => set({ apiKey }),

      secret: import.meta.env.DEV ? 'AdV6fpMIiuf1YhSyKBeBRluQcplWsr3urTnn' : '',
      setSecret: (secret) => set({ secret }),

      isDemoTrade: import.meta.env.DEV ? true : false,
      setIsDemoTrade: (isDemoTrade) => set({ isDemoTrade }),

      rememberMe: true,
      setRememberMe: (rememberMe) => set({ rememberMe }),

      clearStore: () => set({ apiKey: '', secret: '', isDemoTrade: false, rememberMe: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) =>
        state.rememberMe ? { apiKey: state.apiKey, secret: state.secret, isDemoTrade: state.isDemoTrade } : {},
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
      }),
    }
  )
);
