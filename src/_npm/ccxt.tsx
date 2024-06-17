import { type default as ccxtOriginal } from 'ccxt';

const ccxt = (window as any).ccxt as typeof ccxtOriginal;

export default ccxt;
