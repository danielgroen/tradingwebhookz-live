import { makeApiRequest, generateSymbol, parseFullSymbol } from './helpers';
import { subscribeOnStream, unsubscribeFromStream } from './streaming';

// DatafeedConfiguration implementation
const configurationData = {
  // Represents the resolutions for bars supported by your datafeed
  supported_resolutions: ['1', '5', '15', '30', '60', '240', 'D', 'W', 'M'],
  // The `exchanges` arguments are used for the `searchSymbols` method if a user selects the exchange
  exchanges: [{ value: 'bybit', name: 'Bybit', desc: 'Bybit' }],
  // The `symbols_types` arguments are used for the `searchSymbols` method if a user selects this symbol type
  symbols_types: [{ name: 'crypto', value: 'crypto' }],
};

// Use it to keep a record of the most recent bar on the chart
const lastBarsCache = new Map();

// Sample implementation of subscribeOnStream
function subscribeOnStream(
  symbolInfo,
  resolution,
  onRealtimeCallback,
  subscriberUID,
  onResetCacheNeededCallback,
  lastBar
) {
  console.log('[subscribeOnStream]: Subscribing to stream with subscriberUID:', subscriberUID);

  // Sample WebSocket connection
  const socket = new WebSocket('wss://example.com/socket');

  socket.onopen = () => {
    console.log('[WebSocket]: Connection opened');
    socket.send(JSON.stringify({ type: 'subscribe', symbol: symbolInfo.name }));
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'bar') {
      console.log('[WebSocket]: New bar data received', message.data);
      onRealtimeCallback({
        time: message.data.time * 1000,
        low: message.data.low,
        high: message.data.high,
        open: message.data.open,
        close: message.data.close,
        volume: message.data.volume,
      });
    }
  };

  socket.onclose = () => {
    console.log('[WebSocket]: Connection closed');
  };

  socket.onerror = (error) => {
    console.error('[WebSocket]: Error occurred', error);
  };

  // Store socket connection for unsubscribing later
  lastBarsCache.set(subscriberUID, socket);
}

export default {
  onReady: (callback) => {
    console.log('[onReady]: Method call');
    setTimeout(() => callback(configurationData));
  },

  searchSymbols: async (userInput, exchange, symbolType, onResultReadyCallback) => {
    console.log('[searchSymbols]: Method call');
    const symbols = await getAllSymbols();
    const newSymbols = symbols.filter((symbol) => {
      const isExchangeValid = exchange === '' || symbol.exchange === exchange;
      const isFullSymbolContainsInput = symbol.full_name.toLowerCase().indexOf(userInput.toLowerCase()) !== -1;
      return isExchangeValid && isFullSymbolContainsInput;
    });
    onResultReadyCallback(newSymbols);
  },

  resolveSymbol: async (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
    console.log('[resolveSymbol]: Method call', symbolName);
    const symbols = await getAllSymbols();
    const symbolItem = symbols.find(({ full_name }) => full_name === symbolName);
    console.log(symbolName);

    if (!symbolItem && symbolName.includes(':')) {
      console.log('[resolveSymbol]: Cannot resolve symbol', symbolName);
      onResolveErrorCallback('Cannot resolve symbol');
      return;
    }
    // Symbol information object
    console.log('[resolveSymbol]: Symbol resolved', symbolItem);
    onSymbolResolvedCallback({
      ticker: symbolItem?.full_name ?? 'bybit:BTC/USDT',
      name: symbolItem?.symbol ?? 'BTC/USDT',
      description: symbolItem?.description ?? 'BTC/USDT',
      type: symbolItem?.type ?? 'crypto',
      session: '24x7',
      timezone: 'Etc/UTC',
      exchange: symbolItem?.exchange ?? 'bybit',
      minmov: 1,
      pricescale: 100,
      has_intraday: false,
      visible_plots_set: 'ohlc',
      has_weekly_and_monthly: false,
      supported_resolutions: configurationData.supported_resolutions,
      volume_precision: 2,
      data_status: 'streaming',
    });
  },

  getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
    const { from, to, firstDataRequest } = periodParams;
    console.log('[getBars]: Method call', symbolInfo, resolution, from, to);
    const parsedSymbol = parseFullSymbol(`${symbolInfo.exchange}:${symbolInfo.name}`);
    const urlParameters = {
      e: parsedSymbol.exchange,
      fsym: parsedSymbol.fromSymbol,
      tsym: parsedSymbol.toSymbol,
      toTs: to,
      limit: 2000,
    };
    const query = Object.keys(urlParameters)
      .map((name) => `${name}=${encodeURIComponent(urlParameters[name])}`)
      .join('&');
    try {
      const data = await makeApiRequest(`data/histoday?${query}`);
      if ((data.Response && data.Response === 'Error') || data.Data.length === 0) {
        return onHistoryCallback([], { noData: true });
      }
      let bars = [];
      data.Data.forEach((bar) => {
        if (bar.time >= from && bar.time < to) {
          bars = [
            ...bars,
            {
              time: bar.time * 1000,
              low: bar.low,
              high: bar.high,
              open: bar.open,
              close: bar.close,
            },
          ];
        }
      });
      if (firstDataRequest) {
        lastBarsCache.set(`${symbolInfo.exchange}:${symbolInfo.name}`, { ...bars[bars.length - 1] });
      }
      console.log(`[getBars]: returned ${bars.length} bar(s)`);
      onHistoryCallback(bars, { noData: false });
    } catch (error) {
      console.log('[getBars]: Get error', error);
      onErrorCallback(error);
    }
  },

  subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) => {
    console.log('[subscribeBars]: Method call with subscriberUID:', subscriberUID);
    subscribeOnStream(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback,
      lastBarsCache.get(`${symbolInfo.exchange}:${symbolInfo.name}`)
    );
  },

  unsubscribeBars: (subscriberUID) => {
    console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
    unsubscribeFromStream(subscriberUID);
  },
};
