import { type SearchSymbolsCallback } from 'charting_library';

const defaultConfiguration = {
  supports_search: true,
  supports_group_request: false,
  supported_resolutions: ['1', '5', '15', '30', '60', '240', 'D', 'W', 'M'],
  supports_marks: false,
  supports_timescale_marks: false,
  supports_time: true,
};

class CustomDatafeed {
  data: any[];

  constructor(data) {
    this.data = data;
  }

  onReady(callback) {
    setTimeout(() => callback(defaultConfiguration), 0);
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    setTimeout(() => {
      onSymbolResolvedCallback({
        name: symbolName,
        ticker: symbolName,
        description: symbolName,
        type: 'crypto',
        session: '24x7',
        timezone: 'UTC',
        exchange: 'BYBIT',
        minmov: 1,
        pricescale: 100,
        has_intraday: true,
        intraday_multipliers: ['1', '5', '15', '30', '60'],
        supported_resolution: ['1', '5', '15', '30', '60', '240', 'D', 'W', 'M'],
        volume_precision: 2,
        data_status: 'streaming',
      });
    }, 0);
  }

  getBars(symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) {
    const { from, to } = periodParams;
    try {
      const bars = this.data
        .filter((bar) => bar.time >= from * 1000 && bar.time <= to * 1000)
        .map((bar) => ({
          time: bar.time,
          low: bar.low,
          high: bar.high,
          open: bar.open,
          close: bar.close,
          volume: bar.volume,
        }));

      if (!!this.data?.length) {
        onHistoryCallback(this.data, { noData: !!this.data?.length });
      } else {
        console.log('getBars: No data found');
        onHistoryCallback([], { noData: true });
      }
    } catch (error) {
      console.log('getBars error:', error);
      onErrorCallback(error);
    }
  }

  searchSymbols(userInput: string, exchange: string, symbolType: string, onResult: SearchSymbolsCallback): void {
    onResult([
      {
        symbol: 'BTCUSDT.P',
        exchange_logo: 'https://s3-symbol-logo.tradingview.com/provider/bybit.svg',
        logo_urls: [
          'https://s3-symbol-logo.tradingview.com/crypto/XTVCBTC.svg',
          'https://s3-symbol-logo.tradingview.com/crypto/XTVCUSDT.svg',
        ],
        full_name: 'BYBIT:BTCUSDT', // e.g. BTCE:BTCUSD
        description: 'BTCUSDT PERPETUAL CONTRACT',
        exchange: 'BYBIT',
        ticker: 'BTCUSDT',
        type: 'crypto', // "futures"/"crypto"/"forex"/"index"
      },
    ]);
    // Implement the searchSymbols method here
  }

  subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback) {
    console.log('Subscribing bars:', subscribeUID);
  }

  unsubscribeBars(subscriberUID) {
    console.log('Unsubscribing bars:', subscriberUID);
  }
}

export default CustomDatafeed;
