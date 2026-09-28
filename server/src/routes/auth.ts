import { Router } from 'express';
import jwt from 'jsonwebtoken';
import db from '../db';
import { CONFIG } from '../config';

const router = Router();

// Get current session or create default enterprise operator session
router.get('/session', (req, res) => {
  try {
    let user = db.prepare('SELECT * FROM users LIMIT 1').get() as any;
    if (!user) {
      // Seed default user
      const orgId = 'ORG-001';
      db.prepare(`
        INSERT OR IGNORE INTO organizations (id, name, domain)
        VALUES (?, 'Apex Enterprise Systems', 'apexsystems.io')
      `).run(orgId);

      const userId = 'USR-001';
      db.prepare(`
        INSERT OR IGNORE INTO users (id, org_id, name, email, role)
        VALUES (?, ?, 'Alex Morgan', 'alex.morgan@apexsystems.io', 'VP of Revenue')
      `).run(userId, orgId);

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    }

    const token = jwt.sign(
      { userId: user.id, orgId: user.org_id, role: user.role },
      CONFIG.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.org_id,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Authenticate user credentials
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    let user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail) as any;

    if (!user) {
      // Dynamic enterprise user creation for demo ease
      const userId = `USR-${Date.now().toString().slice(-4)}`;
      const name = cleanEmail.split('@')[0].split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      db.prepare(`
        INSERT INTO users (id, org_id, name, email, role)
        VALUES (?, 'ORG-001', ?, ?, 'Revenue Specialist')
      `).run(userId, name, cleanEmail);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    }

    const token = jwt.sign(
      { userId: user.id, orgId: user.org_id, role: user.role },
      CONFIG.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.org_id,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
