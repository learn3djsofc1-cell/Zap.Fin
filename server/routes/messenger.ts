import { Response, Router } from 'express';
import { authMiddleware, AuthRequest } from '../auth.js';
import pool from '../db.js';
import { sendToUser, type WsEvent } from '../websocket.js';

const router = Router();
router.use(authMiddleware);

interface ConversationRow {
  id: string;
  contact_user_id: number | null;
  contact_name: string | null;
  last_message: string;
  last_message_at: Date | string;
  created_at: Date | string;
}

function mapConversationRow(row: ConversationRow) {
  return {
    id: row.id,
    contactUserId: row.contact_user_id,
    contactName: row.contact_name || 'Unknown',
    lastMessage: row.last_message,
    lastMessageAt: row.last_message_at?.toISOString?.() || row.last_message_at,
    unreadCount: 0,
    isEncrypted: true,
  };
}

router.get('/conversations', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      `SELECT c.id, c.contact_user_id, COALESCE(u.name, c.contact_address, 'Unknown') AS contact_name,
              c.last_message, c.last_message_at, c.created_at
       FROM conversations c
       LEFT JOIN users u ON u.id = c.contact_user_id
       WHERE c.user_id = $1
       ORDER BY c.last_message_at DESC`,
      [userId]
    );

    const conversations = result.rows.map(mapConversationRow);
    res.json({ conversations });
  } catch (err) {
    console.error('Messenger conversations error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/conversations', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { contactUserId } = req.body;

    if (!contactUserId || typeof contactUserId !== 'number') {
      res.status(400).json({ error: 'Valid contact user ID is required' });
      return;
    }

    if (contactUserId === userId) {
      res.status(400).json({ error: 'You cannot start a conversation with yourself' });
      return;
    }

    const userCheck = await pool.query(
      'SELECT id, name FROM users WHERE id = $1',
      [contactUserId]
    );
    if (userCheck.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const contactName = userCheck.rows[0].name;

    const existing = await pool.query(
      `SELECT c.id, c.contact_user_id, c.last_message, c.last_message_at, c.created_at
       FROM conversations c
       WHERE c.user_id = $1 AND c.contact_user_id = $2`,
      [userId, contactUserId]
    );

    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      res.json({
        conversation: mapConversationRow({ ...row, contact_name: contactName }),
      });
      return;
    }

    const result = await pool.query(
      `INSERT INTO conversations (user_id, contact_user_id)
       VALUES ($1, $2)
       RETURNING id, contact_user_id, last_message, last_message_at, created_at`,
      [userId, contactUserId]
    );

    const row = result.rows[0];
    const conversation = mapConversationRow({ ...row, contact_name: contactName });
    res.json({ conversation });

    try {
      let recipientConv = await pool.query(
        'SELECT id FROM conversations WHERE user_id = $1 AND contact_user_id = $2',
        [contactUserId, userId]
      );
      if (recipientConv.rows.length === 0) {
        const senderNameResult = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
        const senderDisplayName = senderNameResult.rows[0]?.name || 'Unknown';

        recipientConv = await pool.query(
          `INSERT INTO conversations (user_id, contact_user_id)
           VALUES ($1, $2) RETURNING id, contact_user_id, last_message, last_message_at, created_at`,
          [contactUserId, userId]
        );

        const recipientRow = recipientConv.rows[0];
        sendToUser(contactUserId, {
          type: 'new_conversation',
          payload: mapConversationRow({ ...recipientRow, contact_name: senderDisplayName }),
        });
      }
    } catch (broadcastErr) {
      console.error('WebSocket broadcast error (non-fatal):', broadcastErr);
    }
  } catch (err) {
    console.error('Messenger create conversation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/conversations/:id/messages', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const conversationId = req.params.id;

    const convCheck = await pool.query(
      'SELECT id FROM conversations WHERE id = $1 AND user_id = $2',
      [conversationId, userId]
    );
    if (convCheck.rows.length === 0) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const result = await pool.query(
      `SELECT id, conversation_id, content, sender, self_destruct_seconds, created_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    );

    const messages = result.rows.map((row) => ({
      id: row.id,
      conversationId: row.conversation_id,
      content: row.content,
      sender: row.sender,
      timestamp: row.created_at?.toISOString?.() || row.created_at,
      isEncrypted: true,
      selfDestructSeconds: row.self_destruct_seconds || undefined,
    }));

    res.json({ messages });
  } catch (err) {
    console.error('Messenger messages error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/conversations/:id/messages', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const conversationId = req.params.id;
    const { content, selfDestructSeconds } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Message content required' });
      return;
    }

    const convCheck = await pool.query(
      'SELECT id FROM conversations WHERE id = $1 AND user_id = $2',
      [conversationId, userId]
    );
    if (convCheck.rows.length === 0) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const trimmedContent = content.trim();

    const result = await pool.query(
      `INSERT INTO messages (conversation_id, user_id, content, sender, self_destruct_seconds)
       VALUES ($1, $2, $3, 'me', $4)
       RETURNING id, conversation_id, content, sender, self_destruct_seconds, created_at`,
      [conversationId, userId, trimmedContent, selfDestructSeconds || null]
    );

    const lastMsgPreview = trimmedContent.length > 100 ? trimmedContent.slice(0, 100) + '...' : trimmedContent;

    await pool.query(
      `UPDATE conversations SET last_message = $1, last_message_at = NOW() WHERE id = $2`,
      [lastMsgPreview, conversationId]
    );

    const row = result.rows[0];
    const messagePayload = {
      id: row.id,
      conversationId: row.conversation_id,
      content: row.content,
      sender: row.sender,
      timestamp: row.created_at?.toISOString?.() || row.created_at,
      isEncrypted: true,
      selfDestructSeconds: row.self_destruct_seconds || undefined,
    };

    res.json({ message: messagePayload });

    try {
      const senderConv = await pool.query(
        'SELECT contact_user_id FROM conversations WHERE id = $1',
        [conversationId]
      );
      const recipientId = senderConv.rows[0]?.contact_user_id;

      if (recipientId) {
        const senderName = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
        const senderDisplayName = senderName.rows[0]?.name || 'Unknown';

        let recipientConv = await pool.query(
          'SELECT id FROM conversations WHERE user_id = $1 AND contact_user_id = $2',
          [recipientId, userId]
        );

        if (recipientConv.rows.length === 0) {
          recipientConv = await pool.query(
            `INSERT INTO conversations (user_id, contact_user_id) VALUES ($1, $2)
             RETURNING id`,
            [recipientId, userId]
          );

          sendToUser(recipientId, {
            type: 'new_conversation',
            payload: {
              id: recipientConv.rows[0].id,
              contactUserId: userId,
              contactName: senderDisplayName,
              lastMessage: lastMsgPreview,
              lastMessageAt: row.created_at?.toISOString?.() || row.created_at,
              unreadCount: 1,
              isEncrypted: true,
            },
          });
        }

        const recipientConvId = recipientConv.rows[0].id;

        await pool.query(
          `INSERT INTO messages (conversation_id, user_id, content, sender, self_destruct_seconds)
           VALUES ($1, $2, $3, 'them', $4)`,
          [recipientConvId, userId, trimmedContent, selfDestructSeconds || null]
        );

        await pool.query(
          `UPDATE conversations SET last_message = $1, last_message_at = NOW() WHERE id = $2`,
          [lastMsgPreview, recipientConvId]
        );

        sendToUser(recipientId, {
          type: 'new_message',
          payload: {
            id: row.id,
            conversationId: recipientConvId,
            content: trimmedContent,
            sender: 'them',
            timestamp: row.created_at?.toISOString?.() || row.created_at,
            isEncrypted: true,
            selfDestructSeconds: row.self_destruct_seconds || undefined,
          },
        });

        sendToUser(recipientId, {
          type: 'conversation_update',
          payload: {
            id: recipientConvId,
            contactUserId: userId,
            contactName: senderDisplayName,
            lastMessage: lastMsgPreview,
            lastMessageAt: row.created_at?.toISOString?.() || row.created_at,
            unreadCount: 0,
            isEncrypted: true,
          },
        });
      }
    } catch (broadcastErr) {
      console.error('WebSocket broadcast error (non-fatal):', broadcastErr);
    }
  } catch (err) {
    console.error('Messenger send error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/contacts', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      `SELECT DISTINCT c.contact_user_id, u.name
       FROM conversations c
       JOIN users u ON u.id = c.contact_user_id
       WHERE c.user_id = $1 AND c.contact_user_id IS NOT NULL
       ORDER BY u.name`,
      [userId]
    );
    const contacts = result.rows.map((row) => ({
      id: row.contact_user_id,
      name: row.name,
    }));
    res.json({ contacts });
  } catch (err) {
    console.error('Messenger contacts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/users/search', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const q = req.query.q;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      res.json({ users: [] });
      return;
    }

    const searchTerm = q.trim();
    if (searchTerm.length > 100) {
      res.status(400).json({ error: 'Search query too long' });
      return;
    }

    const result = await pool.query(
      `SELECT id, name FROM users
       WHERE id != $1 AND name ILIKE $2
       ORDER BY name ASC
       LIMIT 10`,
      [userId, `%${searchTerm}%`]
    );

    const users = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
    }));

    res.json({ users });
  } catch (err) {
    console.error('Messenger user search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const messengerRouter = router;
