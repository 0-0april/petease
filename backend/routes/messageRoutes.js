import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  const { messTo, messContent } = req.body;
  
  try {
    const userResult = await pool.query('SELECT "UserID" FROM "USER" WHERE "AccID" = $1', [req.user.accId]);
    
    const result = await pool.query(
      'INSERT INTO "MESSAGES" ("MessFrom", "MessTo", "MessContent") VALUES ($1, $2, $3) RETURNING *',
      [userResult.rows[0].UserID, messTo, messContent]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT "UserID" FROM "USER" WHERE "AccID" = $1', [req.user.accId]);
    
    const result = await pool.query(
      'SELECT m.*, u1."UserName" as from_name, u2."UserName" as to_name FROM "MESSAGES" m JOIN "USER" u1 ON m."MessFrom" = u1."UserID" JOIN "USER" u2 ON m."MessTo" = u2."UserID" WHERE m."MessFrom" = $1 OR m."MessTo" = $1 ORDER BY m."MessTimeStamp" DESC',
      [userResult.rows[0].UserID]
    );
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
