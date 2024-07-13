import { parseFullSymbol, apiKey } from './helpers.js';

// This is a simple implementation of the CryptoCompare streaming API
// https://github.com/tradingview/charting-library-tutorial

const socket = new WebSocket('wss://streamer.cryptocompare.com/v2?api_key=' + apiKey);
const channelToSubscription = new Map();

socket.addEventListener('open', () => {
  console.log('[socket] Connected');
});

socket.addEventListener('close', (reason) => {
  console.log('[socket] Disconnected:', reason);
});

socket.addEventListener('error', (error) => {
  console.log('[socket] Error:', error);
});

socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  const {
    TYPE: eventTypeStr,
    M: exchange,
    FSYM: fromSymbol,
    TSYM: toSymbol,
    TS: tradeTimeStr,
    P: tradePriceStr,
  } = data;

  if (parseInt(eventTypeStr) !== 0) {
    // Skip all non-trading events
    return;
  }
  const tradePrice = parseFloat(tradePriceStr);
  const tradeTime = parseInt(tradeTimeStr);
  const channelString = `0~${exchange}~${fromSymbol}~${toSymbol}`;
  const subscriptionItem = channelToSubscription.get(channelString);
  if (subscriptionItem === undefined) {
    return;
  }
  const lastBar = subscriptionItem.lastBar;
  var coeff = subscriptionItem.resolution * 60;

  var rounded = Math.floor(data.TS / coeff) * coeff;
  var lastBarSec = lastBar.time / 1000;

  let bar;
  if (rounded > lastBarSec) {
    // create a new candle
    bar = {
      time: rounded * 1000,
      open: tradePrice,
      high: tradePrice,
      low: tradePrice,
      close: tradePrice,
    };
  } else {
    bar = {
      ...lastBar,
      high: Math.max(lastBar.high, tradePrice),
      low: Math.min(lastBar.low, tradePrice),
      close: tradePrice,
    };
  }
  subscriptionItem.lastBar = bar;

  // Send data to every subscriber of that symbol
  subscriptionItem.handlers.forEach((handler) => handler.callback(bar));
});

export function subscribeOnStream(
  symbolInfo,
  resolution,
  onRealtimeCallback,
  subscriberUID,
  onResetCacheNeededCallback,
  lastBar
) {
  const parsedSymbol = parseFullSymbol(symbolInfo.full_name);
  const channelString = `0~${parsedSymbol.exchange}~${parsedSymbol.fromSymbol}~${parsedSymbol.toSymbol}`;
  const handler = {
    id: subscriberUID,
    callback: onRealtimeCallback,
  };
  let subscriptionItem = channelToSubscription.get(channelString);
  if (subscriptionItem && subscriptionItem.resolution === resolution) {
    // Already subscribed to the channel, use the existing subscription
    subscriptionItem.handlers.push(handler);
    return;
  }
  subscriptionItem = {
    subscriberUID,
    resolution,
    lastBar,
    handlers: [handler],
  };
  channelToSubscription.set(channelString, subscriptionItem);
  const subRequest = {
    action: 'SubAdd',
    subs: [channelString],
  };
  socket.send(JSON.stringify(subRequest));
}

export function unsubscribeFromStream(subscriberUID) {
  // Find a subscription with id === subscriberUID
  for (const channelString of channelToSubscription.keys()) {
    const subscriptionItem = channelToSubscription.get(channelString);
    const handlerIndex = subscriptionItem.handlers.findIndex((handler) => handler.id === subscriberUID);

    if (handlerIndex !== -1) {
      // Remove from handlers
      subscriptionItem.handlers.splice(handlerIndex, 1);

      if (subscriptionItem.handlers.length === 0) {
        // Unsubscribe from the channel if it was the last handler
        console.log('[unsubscribeBars]: Unsubscribe from streaming. Channel:', channelString);
        const subRequest = {
          action: 'SubRemove',
          subs: [channelString],
        };
        socket.send(JSON.stringify(subRequest));
        channelToSubscription.delete(channelString);
        break;
      }
    }
  }
}
