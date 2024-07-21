// Use Bybit's WebSocket API for live data
const socket = new WebSocket('wss://stream.bybit.com/v5/public/linear');
// const socket = new WebSocket('wss://stream.bybit.com/v5/public/inverse');
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
  const { topic, data: klineData } = data;

  if (!topic || !klineData || !Array.isArray(klineData) || klineData.length === 0) {
    return;
  }

  const subscriptionItem = channelToSubscription.get(topic);
  if (!subscriptionItem) {
    return;
  }

  const lastBar = subscriptionItem.lastBar;
  const tradeTime = klineData[0].timestamp;
  const tradePrice = parseFloat(klineData[0].close);

  const coeff = subscriptionItem.resolution * 60 * 1000; // Resolution in milliseconds
  const rounded = Math.floor(tradeTime / coeff) * coeff;
  const lastBarSec = lastBar.time;

  let bar;
  if (rounded > lastBarSec) {
    bar = {
      time: rounded,
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
  const interval = resolution.toString(); // Ensure interval is a string
  const topic = `kline.${interval}.${symbolInfo.name.replace('-', '')}`; // Remove dashes for Bybit format

  const handler = {
    id: subscriberUID,
    callback: onRealtimeCallback,
  };

  let subscriptionItem = channelToSubscription.get(topic);

  if (subscriptionItem) {
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

  channelToSubscription.set(topic, subscriptionItem);
  const subRequest = {
    op: 'subscribe',
    args: [topic],
  };

  socket.send(JSON.stringify(subRequest));
}

export function unsubscribeFromStream(subscriberUID) {
  // Find a subscription with id === subscriberUID
  for (const topic of channelToSubscription.keys()) {
    const subscriptionItem = channelToSubscription.get(topic);
    const handlerIndex = subscriptionItem.handlers.findIndex((handler) => handler.id === subscriberUID);

    if (handlerIndex !== -1) {
      // Remove from handlers
      subscriptionItem.handlers.splice(handlerIndex, 1);

      if (subscriptionItem.handlers.length === 0) {
        // Unsubscribe from the channel if it was the last handler
        console.log('[unsubscribeBars]: Unsubscribe from streaming. Topic:', topic);
        const subRequest = {
          op: 'unsubscribe',
          args: [topic],
        };
        socket.send(JSON.stringify(subRequest));
        channelToSubscription.delete(topic);
        break;
      }
    }
  }
}
