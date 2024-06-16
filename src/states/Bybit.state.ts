import { create } from 'zustand';

interface BybitStateProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;

  bybitInstance: any | null;
  setBybitInstance: (bybitInstance: any | null) => void;

  apiKey: string;
  setApiKey: (apiKey: string) => void;

  secret: string;
  setSecret: (secret: string) => void;

  isTestnet: boolean;
  setIsTestnet: (isTestnet: boolean) => void;
}

export const BybitState = create<BybitStateProps>((set) => ({
  isLoggedIn: false,
  setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),

  bybitInstance: null,
  setBybitInstance: (bybitInstance) => set({ bybitInstance }),

  apiKey: '2CsRgnKhTpvOuol7EE',
  setApiKey: (apiKey) => set({ apiKey }),

  secret: 'TLAzJpunuJ7QRcyhhdI9xQR7snEI4N4RfR2M',
  setSecret: (secret) => set({ secret }),

  isTestnet: true,
  setIsTestnet: (isTestnet) => set({ isTestnet }),
}));
