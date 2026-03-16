import { Router } from 'express';
function generateLuhnValidVisa() {
    const prefix = '4';
    let digits = prefix;
    for (let i = 1; i < 15; i++) {
        digits += Math.floor(Math.random() * 10).toString();
    }
    let sum = 0;
    for (let i = 0; i < 15; i++) {
        let d = parseInt(digits[i], 10);
        if (i % 2 === 0) {
            d *= 2;
            if (d > 9)
                d -= 9;
        }
        sum += d;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return digits + checkDigit.toString();
}
function formatCardNumber(num) {
    return num.replace(/(.{4})/g, '$1 ').trim();
}
function generateCVV() {
    return Math.floor(100 + Math.random() * 900).toString();
}
function generateExpiry() {
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = (now.getFullYear() + 3) % 100;
    return `${month}/${year.toString().padStart(2, '0')}`;
}
export default function cardRoutes(pool) {
    const router = Router();
    function requireAuth(req, res) {
        if (!req.session.userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return null;
        }
        return req.session.userId;
    }
    router.get('/', async (req, res) => {
        const userId = requireAuth(req, res);
        if (!userId)
            return;
        try {
            const result = await pool.query(`SELECT id, RIGHT(card_number, 4) as last_four, expiry, name, frozen, online_payments, contactless, created_at
         FROM cards WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
            const cards = result.rows.map(c => ({
                ...c,
                card_number_masked: '**** **** **** ' + c.last_four,
            }));
            res.json(cards);
        }
        catch (err) {
            console.error('Get cards error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.post('/create', async (req, res) => {
        const userId = requireAuth(req, res);
        if (!userId)
            return;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('SELECT pg_advisory_xact_lock($1)', [userId]);
            const countResult = await client.query('SELECT COUNT(*) FROM cards WHERE user_id = $1', [userId]);
            if (parseInt(countResult.rows[0].count, 10) >= 2) {
                await client.query('ROLLBACK');
                res.status(400).json({ error: 'Maximum of 2 cards allowed' });
                return;
            }
            const name = req.body.name || 'Virtual Card';
            const cardNumber = generateLuhnValidVisa();
            const cvv = generateCVV();
            const expiry = generateExpiry();
            const result = await client.query(`INSERT INTO cards (user_id, card_number, cvv, expiry, name)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, card_number, cvv, expiry, name, frozen, online_payments, contactless, created_at`, [userId, cardNumber, cvv, expiry, name]);
            await client.query('COMMIT');
            const card = result.rows[0];
            res.status(201).json({
                ...card,
                card_number_masked: '**** **** **** ' + card.card_number.slice(-4),
                card_number_formatted: formatCardNumber(card.card_number),
            });
        }
        catch (err) {
            await client.query('ROLLBACK');
            console.error('Create card error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
        finally {
            client.release();
        }
    });
    router.get('/:id/details', async (req, res) => {
        const userId = requireAuth(req, res);
        if (!userId)
            return;
        try {
            const result = await pool.query(`SELECT id, card_number, cvv, expiry, name, frozen, online_payments, contactless, created_at
         FROM cards WHERE id = $1 AND user_id = $2`, [req.params.id, userId]);
            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Card not found' });
                return;
            }
            const card = result.rows[0];
            res.json({
                ...card,
                card_number_formatted: formatCardNumber(card.card_number),
            });
        }
        catch (err) {
            console.error('Get card details error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.patch('/:id/freeze', async (req, res) => {
        const userId = requireAuth(req, res);
        if (!userId)
            return;
        try {
            const result = await pool.query(`UPDATE cards SET frozen = TRUE WHERE id = $1 AND user_id = $2 RETURNING id, frozen`, [req.params.id, userId]);
            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Card not found' });
                return;
            }
            res.json(result.rows[0]);
        }
        catch (err) {
            console.error('Freeze card error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.patch('/:id/unfreeze', async (req, res) => {
        const userId = requireAuth(req, res);
        if (!userId)
            return;
        try {
            const result = await pool.query(`UPDATE cards SET frozen = FALSE WHERE id = $1 AND user_id = $2 RETURNING id, frozen`, [req.params.id, userId]);
            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Card not found' });
                return;
            }
            res.json(result.rows[0]);
        }
        catch (err) {
            console.error('Unfreeze card error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.patch('/:id/toggle', async (req, res) => {
        const userId = requireAuth(req, res);
        if (!userId)
            return;
        const { field } = req.body;
        const allowedFields = ['frozen', 'online_payments', 'contactless'];
        if (!allowedFields.includes(field)) {
            res.status(400).json({ error: 'Invalid field' });
            return;
        }
        try {
            const result = await pool.query(`UPDATE cards SET ${field} = NOT ${field} WHERE id = $1 AND user_id = $2
         RETURNING id, frozen, online_payments, contactless`, [req.params.id, userId]);
            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Card not found' });
                return;
            }
            res.json(result.rows[0]);
        }
        catch (err) {
            console.error('Toggle card error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    return router;
}
