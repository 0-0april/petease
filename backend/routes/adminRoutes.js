import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { createNotificationsForUsers, createNotificationsForVets } from '../utils/notificationHelper.js';

const router = express.Router();

router.get('/users', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT u.*, a."AccUserName", a."AccEmail", a."AccPhoneNum" FROM "USER" u JOIN "ACCOUNT" a ON u."AccID" = a."AccID"'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/reports', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT r.*, u1."UserName" as reported_user_name, u2."UserName" as reported_by_name FROM "REPORTS" r JOIN "USER" u1 ON r."ReportedUser" = u1."UserID" JOIN "USER" u2 ON r."ReportedBy" = u2."UserID"'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/announcements', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const { title, content, type } = req.body;
  
  try {
    const adminResult = await pool.query('SELECT "AdminID" FROM "ADMIN" WHERE "AccID" = $1', [req.user.accId]);
    
    const result = await pool.query(
      'INSERT INTO "ANNOUNCEMENT" ("AnnounceTitle", "AnnounceContent", "AnnounceType", "AnnouncedBy") VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, type, adminResult.rows[0].AdminID]
    );

    await createNotificationsForUsers({
      title: title || 'New announcement',
      message: content,
      type: 'announcement'
    });

    await createNotificationsForVets({
      title: title || 'New system announcement',
      message: content,
      type: 'announcement'
    });
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
