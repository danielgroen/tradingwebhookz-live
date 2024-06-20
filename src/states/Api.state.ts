import { create } from 'zustand';

interface ApiStateProps {
  fees: null | number;
  setFees: (fees: number) => void;

  apiMinOrderSize: null | number;
  setApiMinOrderSize: (apiMinOrderSize: number) => void;

  apiLeverage: number | null;
  apiLeverageMax: number | null;
  getApiLeverage: () => number | null;
  getApiLeverageMax: () => number | null;
  setApiLeverage: (apiLeverage: number | null) => void;

  tradingPair: string;
  getPrimaryPair: () => string;
  getTradingPairFormatted: () => string;
  getCounterAsset: () => string;
  setTradingPair: (tradingPair: string) => void;
}

export const ApiState = create<ApiStateProps>((set, get) => ({
  fees: null,
  setFees: (fees) => set({ fees }),

  apiMinOrderSize: null,
  setApiMinOrderSize: (apiMinOrderSize) => set({ apiMinOrderSize }),

  apiLeverage: null,
  apiLeverageMax: null,
  getApiLeverage: () => get().apiLeverage,
  getApiLeverageMax: () => get().apiLeverageMax,
  setApiLeverage: (apiLeverage) => set({ apiLeverage }),

  tradingPair: 'BTC/USDT',
  getTradingPairFormatted: () => get().tradingPair.replace('/', ''),
  getPrimaryPair: () => get().tradingPair.split('/')[0],
  getCounterAsset: () => get().tradingPair.split('/')[1],
  setTradingPair: (tradingPair) => set({ tradingPair }),
}));
