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
  // constructor() {
  // this.data = data;
  // }

  onReady(callback) {
    setTimeout(() => callback(defaultConfiguration), 0);
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback) {
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

  async getBars(symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) {
    console.log('GET BARS SYMBOL INFO', resolution);

    try {
      // Calculate start and end timestamps based on periodParams
      const startTimestamp = periodParams.from * 1000; // Convert seconds to milliseconds
      const endTimestamp = periodParams.to * 1000; // Convert seconds to milliseconds

      // Example URL for Bybit API (adjust according to your actual API endpoint)
      const apiUrl = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbolInfo.ticker}&interval=${resolution}&start=${startTimestamp}&end=${endTimestamp}`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      // Format data according to library requirements
      let formattedData = [];

      if (data?.result?.list?.length > 0) {
        formattedData = data.result.list.map((d) => ({
          time: +d[0], // Convert timestamp to number
          low: parseFloat(d[3]),
          high: parseFloat(d[2]),
          open: parseFloat(d[1]),
          close: parseFloat(d[4]),
          volume: +d[5],
        }));

        // Sort data by time in ascending order
        formattedData.sort((a: any, b: any) => a.time - b.time);
      }

      // Ensure correct amount of data is returned
      if (formattedData.length < periodParams.countBack) {
        // Fetch additional earlier bars if available (simulating if necessary)
        // Example: fetch more data or adjust according to your data source
      }

      // Return data to TradingView library
      if (formattedData.length > 0) {
        onHistoryCallback(formattedData, { noData: false });
      } else {
        onHistoryCallback([], { noData: true });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      onErrorCallback(error);
    }
  }

  searchSymbols(_userInput: string, _exchange: string, _symbolType: string, onResult: SearchSymbolsCallback): void {
    onResult([
      {
        symbol: 'BTCUSDT.P',
        exchange_logo: 'https://s3-symbol-logo.tradingview.com/provider/bybit.svg',
        logo_urls: [
          'https://s3-symbol-logo.tradingview.com/crypto/XTVCBTC.svg',
          'https://s3-symbol-logo.tradingview.com/crypto/XTVCUSDT.svg',
        ],
        full_name: 'BYBIT:BTCUSDT',
        description: 'BTCUSDT PERPETUAL CONTRACT',
        exchange: 'bybit',
        ticker: 'BTCUSDT',
        type: 'crypto',
      },
      {
        symbol: 'ETHUSDT.P',
        exchange_logo: 'https://s3-symbol-logo.tradingview.com/provider/bybit.svg',
        logo_urls: [
          'https://s3-symbol-logo.tradingview.com/crypto/XTVCETH.svg',
          'https://s3-symbol-logo.tradingview.com/crypto/XTVCUSDT.svg',
        ],
        full_name: 'BYBIT:ETHUSDT',
        description: 'ETHUSDT PERPETUAL CONTRACT',
        exchange: 'bybit',
        ticker: 'ETHUSDT',
        type: 'crypto',
      },
    ]);
  }

  subscribeBars(_symbolInfo, _resolution, _onRealtimeCallback, subscribeUID) {
    console.log('Subscribing bars:', subscribeUID);
  }

  unsubscribeBars(subscriberUID) {
    console.log('Unsubscribing bars:', subscriberUID);
  }
}

export default CustomDatafeed;
