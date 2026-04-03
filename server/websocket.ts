import { Server as HttpServer, IncomingMessage } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { URL } from 'url';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set and at least 32 characters in production');
    }
    return 'ghostlane-dev-jwt-secret-not-for-production-use-only';
  }
  return secret;
}

export interface WsEvent {
  type: 'new_message' | 'conversation_update' | 'new_conversation';
  payload: Record<string, unknown>;
}

interface AuthenticatedWebSocket extends WebSocket {
  userId: number;
  isAlive: boolean;
}

const clients = new Map<number, Set<AuthenticatedWebSocket>>();

const HEARTBEAT_INTERVAL = 30_000;

let wss: WebSocketServer | null = null;

function removeClient(ws: AuthenticatedWebSocket): void {
  const userSockets = clients.get(ws.userId);
  if (userSockets) {
    userSockets.delete(ws);
    if (userSockets.size === 0) {
      clients.delete(ws.userId);
    }
  }
}

export function setupWebSocket(server: HttpServer): WebSocketServer {
  const JWT_SECRET = getJwtSecret();

  wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req: IncomingMessage, socket, head) => {
    try {
      const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);

      if (url.pathname !== '/ws') {
        socket.destroy();
        return;
      }

      const token = url.searchParams.get('token');
      if (!token) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      let decoded: { userId: number };
      try {
        decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      } catch {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      wss!.handleUpgrade(req, socket, head, (rawWs) => {
        const ws = rawWs as AuthenticatedWebSocket;
        ws.userId = decoded.userId;
        ws.isAlive = true;
        wss!.emit('connection', ws, req);
      });
    } catch {
      socket.destroy();
    }
  });

  wss.on('connection', (rawWs: WebSocket) => {
    const ws = rawWs as AuthenticatedWebSocket;

    if (!clients.has(ws.userId)) {
      clients.set(ws.userId, new Set());
    }
    clients.get(ws.userId)!.add(ws);

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('close', () => {
      removeClient(ws);
    });

    ws.on('error', () => {
      ws.close();
    });
  });

  const heartbeat = setInterval(() => {
    if (!wss) return;

    wss.clients.forEach((rawWs) => {
      const ws = rawWs as AuthenticatedWebSocket;

      if (ws.isAlive === false) {
        removeClient(ws);
        ws.terminate();
        return;
      }

      ws.isAlive = false;
      ws.ping();
    });
  }, HEARTBEAT_INTERVAL);

  wss.on('close', () => {
    clearInterval(heartbeat);
  });

  return wss;
}

export function sendToUser(userId: number, event: WsEvent): void {
  const userSockets = clients.get(userId);
  if (!userSockets) return;

  const data = JSON.stringify(event);

  for (const ws of userSockets) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  }
}

export function getConnectedUserIds(): number[] {
  return Array.from(clients.keys());
}
