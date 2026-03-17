import { Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import { authMiddleware, AuthRequest } from '../auth.js';
import pool from '../db.js';

const router = Router();
router.use(authMiddleware);

router.get('/profile', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
      [req.userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error('Settings profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/profile', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email } = req.body;
    const updates: string[] = [];
    const values: (string | number)[] = [];
    let idx = 1;

    if (name !== undefined) {
      updates.push(`name = $${idx++}`);
      values.push(name);
    }
    if (email !== undefined) {
      updates.push(`email = $${idx++}`);
      values.push(email);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(req.userId);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, email, name, created_at`,
      values
    );
    res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error('Settings update profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/password', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current and new password required' });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters' });
      return;
    }
    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.userId]);
    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const valid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!valid) {
      res.status(400).json({ error: 'Current password is incorrect' });
      return;
    }
    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Settings password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/2fa', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { enabled } = req.body;
    res.json({ twoFactor: { enabled: !!enabled } });
  } catch (err) {
    console.error('Settings 2FA error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/sessions', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ sessions: [] });
  } catch (err) {
    console.error('Settings sessions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/sessions/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ success: true });
  } catch (err) {
    console.error('Settings revoke session error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const DEFAULT_NOTIFICATION_PREFS = [
  { key: 'mix_operations', label: 'Mix Operations', description: 'Get notified when mix operations complete', enabled: true },
  { key: 'bridge_transfers', label: 'Bridge Transfers', description: 'Alerts for cross-chain transfer status changes', enabled: true },
  { key: 'security_alerts', label: 'Security Alerts', description: 'Notifications for login attempts and security events', enabled: true },
  { key: 'vpn_connection', label: 'VPN Connection', description: 'Alerts when VPN connection drops or changes', enabled: false },
  { key: 'new_messages', label: 'New Messages', description: 'Notifications for new encrypted messages', enabled: true },
];

router.get('/notifications', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ preferences: DEFAULT_NOTIFICATION_PREFS });
  } catch (err) {
    console.error('Settings notifications error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/notifications/:key', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const { enabled } = req.body;
    const pref = DEFAULT_NOTIFICATION_PREFS.find((p) => p.key === key);
    if (!pref) {
      res.status(404).json({ error: 'Notification preference not found' });
      return;
    }
    res.json({ preference: { ...pref, enabled: !!enabled } });
  } catch (err) {
    console.error('Settings update notification error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const settingsRouter = router;
