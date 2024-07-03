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
  primaryPair: string;
  tradingPairFormatted: () => string;
  counterAsset: string;
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

  // tradingPair: 'BTC/USDT', //cryptocompare
  tradingPair: 'BTCUSD',
  tradingPairFormatted: () => get().tradingPair + 'T',
  primaryPair: 'BTC',
  counterAsset: 'USDT', // NOW STATIC
  setTradingPair: (tradingPair) =>
    set({
      tradingPair,
      primaryPair: tradingPair.split('USD')[0],
    }),
}));
