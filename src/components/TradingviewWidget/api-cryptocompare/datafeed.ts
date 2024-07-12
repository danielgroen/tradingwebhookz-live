import { makeApiRequest, generateSymbol, parseFullSymbol } from './helpers.js';
import { subscribeOnStream, unsubscribeFromStream } from './streaming.js';

// This is a simple implementation of the CryptoCompare streaming API
// https://github.com/tradingview/charting-library-tutorial

const lastBarsCache = new Map();

// DatafeedConfiguration implementation
const configurationData = {
  // Represents the resolutions for bars supported by your datafeed
  supported_resolutions: ['1', '2', '5', '15', '30', '60', '120', '240', '360', '720', 'D', '1D', 'W', '1W'],
  supports_group_request: false,
  supports_marks: false,
  supports_search: true,
  supports_timescale_marks: false,

  // The `exchanges` arguments are used for the `searchSymbols` method if a user selects the exchange
  exchanges: [
    {
      value: 'bybit',
      name: 'Bybit',
      desc: 'Bybit',
    },
  ],
  // The `symbols_types` arguments are used for the `searchSymbols` method if a user selects this symbol type
  symbols_types: [
    {
      name: 'crypto',
      value: 'crypto',
    },
  ],
};

// Obtains all symbols for all exchanges supported by CryptoCompare API
async function getAllSymbols() {
  const data = await makeApiRequest('data/v3/all/exchanges');
  let allSymbols = [];

  for (const exchange of configurationData.exchanges) {
    const pairs = data.Data[exchange.value].pairs;
    console.log('exchange', pairs);

    for (const leftPairPart of Object.keys(pairs)) {
      const symbols = pairs[leftPairPart].map((rightPairPart) => {
        const symbol = generateSymbol(exchange.value, leftPairPart, rightPairPart);
        return {
          symbol: symbol.short,
          full_name: symbol.full,
          description: symbol.short,
          exchange: exchange.value,
          exchange_logo: 'https://s3-symbol-logo.tradingview.com/provider/bybit.svg',
          type: 'crypto',
          ...(import.meta.env.PROD && {
            logo_urls: [
              `https://s3-symbol-logo.tradingview.com/crypto/XTVC${leftPairPart}.svg`,
              `https://s3-symbol-logo.tradingview.com/crypto/XTVC${rightPairPart}.svg`,
            ],
          }),
        };
      });
      allSymbols = [...allSymbols, ...symbols];
    }
  }
  return allSymbols;
}

export default {
  onReady: (callback) => {
    setTimeout(() => callback(configurationData));
  },

  searchSymbols: async (userInput, exchange, symbolType, onResultReadyCallback) => {
    const symbols = await getAllSymbols();

    const newSymbols = symbols.filter((symbol) => {
      const isExchangeValid = exchange === '' || symbol.exchange === exchange;
      const isFullSymbolContainsInput = symbol.full_name.toLowerCase().indexOf(userInput.toLowerCase()) !== -1;
      return isExchangeValid && isFullSymbolContainsInput;
    });
    onResultReadyCallback(newSymbols);
  },

  resolveSymbol: async (symbolName, onSymbolResolvedCallback, onResolveErrorCallback, extension) => {
    const symbols = await getAllSymbols();
    const symbolItem = symbols.find(({ full_name }) => full_name === symbolName);

    if (!symbolItem) {
      onResolveErrorCallback('cannot resolve symbol');
      return;
    }
    // Symbol information object
    const symbolInfo = {
      ticker: symbolItem.full_name,
      name: symbolItem.symbol,
      description: symbolItem.description,
      type: symbolItem.type,
      session: '24x7',
      timezone: 'Etc/UTC',
      exchange: symbolItem.exchange,
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      intraday_multipliers: ['1', '60'],
      has_no_volume: true,
      has_weekly_and_monthly: false,
      supported_resolutions: configurationData.supported_resolutions,
      volume_precision: 2,
      data_status: 'streaming',
    };

    onSymbolResolvedCallback(symbolInfo);
  },

  getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
    const { from, to, firstDataRequest } = periodParams;
    const parsedSymbol = parseFullSymbol(symbolInfo.full_name);

    let urlParameters = {
      e: parsedSymbol.exchange,
      fsym: parsedSymbol.fromSymbol,
      tsym: parsedSymbol.toSymbol,
      toTs: to,
      limit: 2000,
    };

    let endpoint;

    if (['1', '2', '5', '15', '30'].includes(resolution)) {
      endpoint = 'data/v2/histominute';
    } else if (['60', '120', '240', '360', '720'].includes(resolution)) {
      endpoint = 'data/v2/histohour';
    } else {
      endpoint = 'data/v2/histoday'; // Updated to v2 endpoint
    }

    const query = Object.keys(urlParameters)
      .map((name) => `${name}=${encodeURIComponent(urlParameters[name])}`)
      .join('&');

    try {
      const data = await makeApiRequest(`${endpoint}?${query}`);

      if (!data || data.Response !== 'Success' || !data.Data || data.Data.length === 0) {
        onHistoryCallback([], { noData: true });
        return;
      }

      let bars = data?.Data?.Data.map((bar) => ({
        time: bar.time * 1000,
        low: bar.low,
        high: bar.high,
        open: bar.open,
        close: bar.close,
        volume: bar.volumefrom,
      }));

      if (firstDataRequest) {
        lastBarsCache.set(symbolInfo.full_name, { ...bars[bars.length - 1] });
      }

      onHistoryCallback(bars, { noData: false });
    } catch (error) {
      console.error('Error fetching or processing data:', error);
      onErrorCallback(error);
    }
  },

  calculateHistoryDepth: (resolution, resolutionBack, intervalBack) => {
    //optional
    console.log('=====calculateHistoryDepth running');
    // while optional, this makes sure we request 24 hours of minute data at a time
    // CryptoCompare's minute data endpoint will throw an error if we request data beyond 7 days in the past, and return no data
    return resolution < 60 ? { resolutionBack: 'D', intervalBack: '1' } : undefined;
  },
  getServerTime: (cb) => {
    console.log('=====getServerTime running');
  },

  subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) => {
    subscribeOnStream(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback,
      lastBarsCache.get(symbolInfo.full_name)
    );
  },

  unsubscribeBars: (subscriberUID) => {
    unsubscribeFromStream(subscriberUID);
  },
};
