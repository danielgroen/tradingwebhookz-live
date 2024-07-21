const channelToSubscription = new Map();

class WebSocketManager {
  private socket: WebSocket | null = null;
  private url: string;
  private category: string;
  private connectionAttempts: number = 0;
  private maxAttempts: number = 5; // Maximum reconnection attempts
  private messageQueue: any[] = []; // Queue for messages to be sent

  constructor(url: string, category: string) {
    this.url = url;
    this.category = category;
    this.connect();
  }

  private connect() {
    this.socket = new WebSocket(this.url);

    this.socket.addEventListener('open', () => {
      this.connectionAttempts = 0; // Reset attempts on successful connection
      this.flushMessageQueue(); // Send any queued messages
    });

    this.socket.addEventListener('close', (reason) => {
      this.handleReconnection();
    });

    this.socket.addEventListener('error', (error) => {
      console.log(`[socket - ${this.category}] Error:`, error);
      this.handleReconnection();
    });

    this.socket.addEventListener('message', (event) => {
      this.handleMessage(event.data);
    });
  }

  private handleReconnection() {
    if (this.connectionAttempts < this.maxAttempts) {
      setTimeout(
        () => {
          console.log(`[socket - ${this.category}] Attempting to reconnect...`);
          this.connectionAttempts += 1;
          this.connect();
        },
        1000 * Math.pow(2, this.connectionAttempts)
      ); // Exponential backoff
    } else {
      console.error(`[socket - ${this.category}] Maximum reconnection attempts reached.`);
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        console.log(`[socket - ${this.category}] Sending queued message:`, message);
        this.socket.send(JSON.stringify(message));
      } else {
        console.warn(`[socket - ${this.category}] Cannot send queued message, socket not open.`);
        this.messageQueue.unshift(message); // Requeue the message if the socket is not open
        break; // Stop sending messages until the socket is open again
      }
    }
  }

  public send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log(`[socket - ${this.category}] Sending message:`, data);
      this.socket.send(JSON.stringify(data));
    } else {
      console.error(`[socket - ${this.category}] Attempted to send message on a non-open socket.`);
      this.messageQueue.push(data); // Queue the message if the socket is not open
      this.handleReconnection(); // Optionally handle reconnection logic here
    }
  }

  private handleMessage(data: any) {
    try {
      const parsedData = JSON.parse(data);
      const { topic, data: klineData } = parsedData;

      if (!topic || !klineData || !Array.isArray(klineData) || klineData.length === 0) {
        console.warn(`[socket - ${this.category}] Invalid message data`, parsedData);
        return;
      }

      const subscriptionItem = channelToSubscription.get(topic);
      if (!subscriptionItem) {
        console.warn(`[socket - ${this.category}] No subscription found for topic`, topic);
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
    } catch (error) {
      console.error(`[socket - ${this.category}] Error processing message:`, error);
    }
  }
}

const linearSocketManager = new WebSocketManager('wss://stream.bybit.com/v5/public/linear', 'linear');
const inverseSocketManager = new WebSocketManager('wss://stream.bybit.com/v5/public/inverse', 'inverse');

export function subscribeOnStream(
  symbolInfo,
  resolution,
  onRealtimeCallback,
  subscriberUID,
  onResetCacheNeededCallback,
  lastBar,
  category
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

  // Choose the correct socket manager based on the category
  let socketManager;

  if (category === 'inverse') socketManager = inverseSocketManager;
  else if (category === 'linear') socketManager = linearSocketManager;
  socketManager.send(subRequest);
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
        const socketManager = topic.includes('linear') ? linearSocketManager : inverseSocketManager;
        socketManager.send(subRequest);
        channelToSubscription.delete(topic);
        break;
      }
    }
  }
}
