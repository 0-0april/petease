import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT u.*, a."AccUserName", a."AccEmail", a."AccPhoneNum" FROM "USER" u JOIN "ACCOUNT" a ON u."AccID" = a."AccID" WHERE a."AccID" = $1',
      [req.user.accId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
