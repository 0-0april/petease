import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/appointments', authenticateToken, authorizeRole('vet'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT ap.*, p."PetName", u."UserName", s."ServType" FROM "APPOINTMENT" ap JOIN "USERPETS" up ON ap."UserPetID" = up."UserPetID" JOIN "PET" p ON up."PetID" = p."PetID" JOIN "USER" u ON up."UserID" = u."UserID" JOIN "SERVICES" s ON ap."ServID" = s."ServID" ORDER BY ap."AppointSchedDate"'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/appointments/:id', authenticateToken, authorizeRole('vet'), async (req, res) => {
  const { status } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE "APPOINTMENT" SET "AppointStatus" = $1 WHERE "AppointID" = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/services', authenticateToken, authorizeRole('vet'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "SERVICES"');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
