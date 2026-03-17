import { Response, Router } from 'express';
import { authMiddleware, AuthRequest } from '../auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/conversations', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ conversations: [] });
  } catch (err) {
    console.error('Messenger conversations error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/conversations', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { contactAddress, contactName } = req.body;
    if (!contactAddress || !contactName) {
      res.status(400).json({ error: 'Contact address and name required' });
      return;
    }
    const conversation = {
      id: crypto.randomUUID(),
      contactName,
      contactAddress,
      lastMessage: '',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      isEncrypted: true,
    };
    res.json({ conversation });
  } catch (err) {
    console.error('Messenger create conversation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/conversations/:id/messages', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ messages: [] });
  } catch (err) {
    console.error('Messenger messages error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/conversations/:id/messages', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, selfDestructSeconds } = req.body;
    if (!content) {
      res.status(400).json({ error: 'Message content required' });
      return;
    }
    const message = {
      id: crypto.randomUUID(),
      conversationId: req.params.id,
      content,
      sender: 'me',
      timestamp: new Date().toISOString(),
      isEncrypted: true,
      selfDestructSeconds: selfDestructSeconds || undefined,
    };
    res.json({ message });
  } catch (err) {
    console.error('Messenger send error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/contacts', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ contacts: [] });
  } catch (err) {
    console.error('Messenger contacts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const messengerRouter = router;
