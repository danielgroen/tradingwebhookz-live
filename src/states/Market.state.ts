import { create } from 'zustand';

interface MarketStateProps {
  fees: string;
  setFees: (fees: string) => void;

  tradingPair: string;
  getPrimaryPair: () => string;
  getCounterAsset: () => string;
  setTradingPair: (tradingPair: string) => void;
}

export const MarketState = create<MarketStateProps>((set, get) => ({
  fees: '0.02',
  setFees: (fees) => set({ fees }),

  tradingPair: 'BTC/USDT',
  getPrimaryPair: () => get().tradingPair.split('/')[0],
  getCounterAsset: () => get().tradingPair.split('/')[1],
  setTradingPair: (tradingPair) => set({ tradingPair }),
}));
