import { Response, Router } from 'express';
import { authMiddleware, AuthRequest } from '../auth.js';
import pool from '../db.js';

const router = Router();
router.use(authMiddleware);

function mapConversationRow(row: any) {
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
      `SELECT c.id, c.contact_user_id, u.name AS contact_name,
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
    res.json({
      conversation: mapConversationRow({ ...row, contact_name: contactName }),
    });
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

    await pool.query(
      `UPDATE conversations SET last_message = $1, last_message_at = NOW() WHERE id = $2`,
      [trimmedContent.length > 100 ? trimmedContent.slice(0, 100) + '...' : trimmedContent, conversationId]
    );

    const row = result.rows[0];
    res.json({
      message: {
        id: row.id,
        conversationId: row.conversation_id,
        content: row.content,
        sender: row.sender,
        timestamp: row.created_at?.toISOString?.() || row.created_at,
        isEncrypted: true,
        selfDestructSeconds: row.self_destruct_seconds || undefined,
      },
    });
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
