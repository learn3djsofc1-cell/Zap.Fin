import { Response, Router } from 'express';
import { authMiddleware, AuthRequest } from '../auth.js';
import pool from '../db.js';

const router = Router();
router.use(authMiddleware);

const ETH_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

function isValidEthereumAddress(address: string): boolean {
  return ETH_ADDRESS_RE.test(address);
}

router.get('/conversations', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      `SELECT id, contact_address, last_message, last_message_at, created_at
       FROM conversations
       WHERE user_id = $1
       ORDER BY last_message_at DESC`,
      [userId]
    );

    const conversations = result.rows.map((row) => ({
      id: row.id,
      contactAddress: row.contact_address,
      lastMessage: row.last_message,
      lastMessageAt: row.last_message_at?.toISOString?.() || row.last_message_at,
      unreadCount: 0,
      isEncrypted: true,
    }));

    res.json({ conversations });
  } catch (err) {
    console.error('Messenger conversations error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/conversations', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { contactAddress } = req.body;

    if (!contactAddress) {
      res.status(400).json({ error: 'Ethereum address is required' });
      return;
    }

    const trimmed = contactAddress.trim();
    if (!isValidEthereumAddress(trimmed)) {
      res.status(400).json({ error: 'Invalid Ethereum address. Must start with 0x followed by 40 hex characters.' });
      return;
    }

    const existing = await pool.query(
      'SELECT id, contact_address, last_message, last_message_at, created_at FROM conversations WHERE user_id = $1 AND contact_address = $2',
      [userId, trimmed]
    );

    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      res.json({
        conversation: {
          id: row.id,
          contactAddress: row.contact_address,
          lastMessage: row.last_message,
          lastMessageAt: row.last_message_at?.toISOString?.() || row.last_message_at,
          unreadCount: 0,
          isEncrypted: true,
        },
      });
      return;
    }

    const result = await pool.query(
      `INSERT INTO conversations (user_id, contact_address)
       VALUES ($1, $2)
       RETURNING id, contact_address, last_message, last_message_at, created_at`,
      [userId, trimmed]
    );

    const row = result.rows[0];
    res.json({
      conversation: {
        id: row.id,
        contactAddress: row.contact_address,
        lastMessage: row.last_message,
        lastMessageAt: row.last_message_at?.toISOString?.() || row.last_message_at,
        unreadCount: 0,
        isEncrypted: true,
      },
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
      `SELECT DISTINCT contact_address FROM conversations WHERE user_id = $1 ORDER BY contact_address`,
      [userId]
    );
    const contacts = result.rows.map((row) => ({
      id: row.contact_address,
      address: row.contact_address,
    }));
    res.json({ contacts });
  } catch (err) {
    console.error('Messenger contacts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const messengerRouter = router;
