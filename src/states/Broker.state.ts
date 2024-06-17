// import { type bybit } from 'ccxt';
import { create } from 'zustand';

interface BrokerStateProps {
  brokerInstance: any | null;
  setBrokerInstance: (brokerInstance: any | null) => void;

  apiKey: string;
  setApiKey: (apiKey: string) => void;

  secret: string;
  setSecret: (secret: string) => void;

  isTestnet: boolean;
  setIsTestnet: (isTestnet: boolean) => void;
}

export const BrokerState = create<BrokerStateProps>((set) => ({
  brokerInstance: null,
  setBrokerInstance: (brokerInstance) => set({ brokerInstance }),

  apiKey: '2CsRgnKhTpvOuol7EE',
  setApiKey: (apiKey) => set({ apiKey }),

  secret: 'TLAzJpunuJ7QRcyhhdI9xQR7snEI4N4RfR2M',
  setSecret: (secret) => set({ secret }),

  isTestnet: true,
  setIsTestnet: (isTestnet) => set({ isTestnet }),
}));
