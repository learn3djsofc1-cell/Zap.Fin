import { getToken } from './api';

export interface WsEvent {
  type: 'new_message' | 'conversation_update' | 'new_conversation';
  payload: Record<string, unknown>;
}

type EventHandler = (event: WsEvent) => void;

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;

let ws: WebSocket | null = null;
let reconnectAttempts = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let intentionalClose = false;
const listeners = new Set<EventHandler>();

function getWsUrl(): string | null {
  const token = getToken();
  if (!token) return null;

  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}/ws?token=${encodeURIComponent(token)}`;
}

function scheduleReconnect() {
  if (intentionalClose) return;

  const delay = Math.min(
    RECONNECT_BASE_MS * Math.pow(2, reconnectAttempts),
    RECONNECT_MAX_MS
  );
  reconnectAttempts++;

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, delay);
}

export function connect(): void {
  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
    return;
  }

  const url = getWsUrl();
  if (!url) return;

  intentionalClose = false;

  try {
    ws = new WebSocket(url);
  } catch {
    scheduleReconnect();
    return;
  }

  ws.onopen = () => {
    reconnectAttempts = 0;
  };

  ws.onmessage = (event) => {
    try {
      const data: WsEvent = JSON.parse(event.data);
      if (data.type && data.payload) {
        for (const handler of listeners) {
          try {
            handler(data);
          } catch (handlerErr) {
            console.error('[WS] Event handler error:', handlerErr);
          }
        }
      }
    } catch (parseErr) {
      console.error('[WS] Message parse error:', parseErr);
    }
  };

  ws.onclose = () => {
    ws = null;
    scheduleReconnect();
  };

  ws.onerror = () => {
    if (ws) {
      ws.close();
    }
  };
}

export function disconnect(): void {
  intentionalClose = true;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (ws) {
    ws.close();
    ws = null;
  }
  reconnectAttempts = 0;
}

export function subscribe(handler: EventHandler): () => void {
  listeners.add(handler);
  return () => {
    listeners.delete(handler);
  };
}

export function isConnected(): boolean {
  return ws !== null && ws.readyState === WebSocket.OPEN;
}
