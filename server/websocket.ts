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

const clients = new Map<number, Set<WebSocket>>();

const HEARTBEAT_INTERVAL = 30_000;
const PONG_TIMEOUT = 10_000;

let wss: WebSocketServer | null = null;

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

      wss!.handleUpgrade(req, socket, head, (ws) => {
        (ws as any).userId = decoded.userId;
        (ws as any).isAlive = true;
        wss!.emit('connection', ws, req);
      });
    } catch {
      socket.destroy();
    }
  });

  wss.on('connection', (ws: WebSocket) => {
    const userId = (ws as any).userId as number;

    if (!clients.has(userId)) {
      clients.set(userId, new Set());
    }
    clients.get(userId)!.add(ws);

    ws.on('pong', () => {
      (ws as any).isAlive = true;
    });

    ws.on('close', () => {
      const userSockets = clients.get(userId);
      if (userSockets) {
        userSockets.delete(ws);
        if (userSockets.size === 0) {
          clients.delete(userId);
        }
      }
    });

    ws.on('error', () => {
      ws.close();
    });
  });

  const heartbeat = setInterval(() => {
    if (!wss) return;

    wss.clients.forEach((ws) => {
      if ((ws as any).isAlive === false) {
        const userId = (ws as any).userId as number;
        const userSockets = clients.get(userId);
        if (userSockets) {
          userSockets.delete(ws);
          if (userSockets.size === 0) {
            clients.delete(userId);
          }
        }
        ws.terminate();
        return;
      }

      (ws as any).isAlive = false;
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
