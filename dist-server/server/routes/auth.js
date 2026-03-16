import { Router } from 'express';
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;
export default function authRoutes(pool) {
    const router = Router();
    router.post('/signup', async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ error: 'Email and password are required' });
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                res.status(400).json({ error: 'Invalid email format' });
                return;
            }
            if (password.length < 8) {
                res.status(400).json({ error: 'Password must be at least 8 characters' });
                return;
            }
            const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
            if (existing.rows.length > 0) {
                res.status(409).json({ error: 'An account with this email already exists' });
                return;
            }
            const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
            const result = await pool.query('INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at', [email.toLowerCase(), passwordHash]);
            const user = result.rows[0];
            req.session.userId = user.id;
            res.status(201).json({ id: user.id, email: user.email });
        }
        catch (err) {
            console.error('Signup error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.post('/login', async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ error: 'Email and password are required' });
                return;
            }
            const result = await pool.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email.toLowerCase()]);
            if (result.rows.length === 0) {
                res.status(401).json({ error: 'Invalid email or password' });
                return;
            }
            const user = result.rows[0];
            const valid = await bcrypt.compare(password, user.password_hash);
            if (!valid) {
                res.status(401).json({ error: 'Invalid email or password' });
                return;
            }
            req.session.userId = user.id;
            res.json({ id: user.id, email: user.email });
        }
        catch (err) {
            console.error('Login error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.post('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                res.status(500).json({ error: 'Failed to logout' });
                return;
            }
            res.clearCookie('connect.sid');
            res.json({ success: true });
        });
    });
    router.get('/me', async (req, res) => {
        if (!req.session.userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        try {
            const result = await pool.query('SELECT id, email, created_at FROM users WHERE id = $1', [req.session.userId]);
            if (result.rows.length === 0) {
                req.session.destroy(() => { });
                res.status(401).json({ error: 'User not found' });
                return;
            }
            res.json(result.rows[0]);
        }
        catch (err) {
            console.error('Me error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    return router;
}
