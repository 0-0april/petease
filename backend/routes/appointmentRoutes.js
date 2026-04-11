import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  const { userPetId, servId, appointSchedDate } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO "APPOINTMENT" ("UserPetID", "ServID", "AppointSchedDate") VALUES ($1, $2, $3) RETURNING *',
      [userPetId, servId, appointSchedDate]
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
      'SELECT ap.*, p."PetName", s."ServType" FROM "APPOINTMENT" ap JOIN "USERPETS" up ON ap."UserPetID" = up."UserPetID" JOIN "PET" p ON up."PetID" = p."PetID" JOIN "SERVICES" s ON ap."ServID" = s."ServID" WHERE up."UserID" = $1',
      [userResult.rows[0].UserID]
    );
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
