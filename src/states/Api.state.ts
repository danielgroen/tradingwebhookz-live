import { create } from 'zustand';
import { type bybit } from 'ccxt';

export interface ApiStateProps {
  fees: { maker: number | null; taker: number | null };
  setFees: (fees: { maker: number | null; taker: number | null }) => void;

  apiMinOrderSize: null | string;
  apiMaxOrderSize: null | string;
  setApiMinOrderSize: (apiMinOrderSize: string) => void;
  setApiMaxOrderSize: (apiMaxOrderSize: string) => void;

  apiLeverage: number | null;
  apiLeverageMax: number | null;
  apiLeverageStepSize: number | null;
  setApiLeverage: (apiLeverage: number | null) => void;
  setApiLeverageMax: (apiLeverageMax: number | null) => void;
  setApiLeverageStepSize: (apiLeverageStepSize: number | null) => void;

  tradingPair: string;
  primaryPair: string;
  tradingPairFormatted: () => string;
  counterAsset: string;
  setTradingPair: (tradingPair: string) => void;

  brokerInstance: bybit | null;
  setBrokerInstance: (brokerInstance: bybit | null) => void;
}

export const ApiState = create<ApiStateProps>((set, get) => ({
  fees: { maker: null, taker: null },
  setFees: (fees) => set({ fees }),

  apiMinOrderSize: null,
  apiMaxOrderSize: null,
  setApiMinOrderSize: (apiMinOrderSize) => set({ apiMinOrderSize }),
  setApiMaxOrderSize: (apiMaxOrderSize) => set({ apiMaxOrderSize }),

  apiLeverage: null,
  apiLeverageMax: null,
  apiLeverageStepSize: null,
  setApiLeverage: (apiLeverage) => set({ apiLeverage }),
  setApiLeverageMax: (apiLeverageMax) => set({ apiLeverageMax }),
  setApiLeverageStepSize: (apiLeverageStepSize) => set({ apiLeverageStepSize }),

  tradingPair: 'BTC/USDT',
  tradingPairFormatted: () => get().tradingPair.replace('/', ''),
  primaryPair: 'BTC',
  counterAsset: 'USDT',
  setTradingPair: (tradingPair) =>
    set({
      tradingPair,
      primaryPair: tradingPair.split('/')[0],
      counterAsset: tradingPair.split('/')[1],
    }),

  brokerInstance: null,
  setBrokerInstance: (brokerInstance) => set({ brokerInstance }),
}));
