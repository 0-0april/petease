import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { createNotification } from '../utils/notificationHelper.js';

const router = express.Router();

// Send a message
router.post('/', authenticateToken, async (req, res) => {
  const { messTo, messContent } = req.body;
  
  try {
    const userResult = await pool.query('SELECT "UserID", "UserName" FROM "USER" WHERE "AccID" = $1', [req.user.accId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const result = await pool.query(
      'INSERT INTO "MESSAGES" ("MessFrom", "MessTo", "MessContent") VALUES ($1, $2, $3) RETURNING *',
      [userResult.rows[0].UserID, messTo, messContent]
    );

    const receiverResult = await pool.query(
      'SELECT "AccID" FROM "USER" WHERE "UserID" = $1',
      [messTo]
    );

    if (receiverResult.rows.length > 0) {
      await createNotification({
        accId: receiverResult.rows[0].AccID,
        title: 'New message received',
        message: `${userResult.rows[0].UserName} sent you a message.`,
        type: 'message'
      });
    }
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all conversations (list of users you've chatted with)
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT "UserID" FROM "USER" WHERE "AccID" = $1', [req.user.accId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const currentUserId = userResult.rows[0].UserID;
    
    // Get unique users you've chatted with and their last message
    const result = await pool.query(
      `SELECT DISTINCT ON (other_user_id)
        other_user_id,
        other_user_name,
        last_message,
        last_message_time
       FROM (
         SELECT 
           CASE 
             WHEN m."MessFrom" = $1 THEN m."MessTo"
             ELSE m."MessFrom"
           END as other_user_id,
           CASE 
             WHEN m."MessFrom" = $1 THEN u2."UserName"
             ELSE u1."UserName"
           END as other_user_name,
           m."MessContent" as last_message,
           m."MessTimeStamp" as last_message_time
         FROM "MESSAGES" m
         LEFT JOIN "USER" u1 ON m."MessFrom" = u1."UserID"
         LEFT JOIN "USER" u2 ON m."MessTo" = u2."UserID"
         WHERE m."MessFrom" = $1 OR m."MessTo" = $1
         ORDER BY m."MessTimeStamp" DESC
       ) conversations
       ORDER BY other_user_id, last_message_time DESC`,
      [currentUserId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get messages with a specific user
router.get('/with/:userId', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT "UserID" FROM "USER" WHERE "AccID" = $1', [req.user.accId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const currentUserId = userResult.rows[0].UserID;
    const otherUserId = req.params.userId;
    
    const result = await pool.query(
      `SELECT m.*, 
              u1."UserName" as from_name, 
              u2."UserName" as to_name 
       FROM "MESSAGES" m 
       JOIN "USER" u1 ON m."MessFrom" = u1."UserID" 
       JOIN "USER" u2 ON m."MessTo" = u2."UserID" 
       WHERE (m."MessFrom" = $1 AND m."MessTo" = $2) 
          OR (m."MessFrom" = $2 AND m."MessTo" = $1)
       ORDER BY m."MessTimeStamp" ASC`,
      [currentUserId, otherUserId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
