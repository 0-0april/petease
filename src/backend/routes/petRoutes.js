import express from 'express';
import multer from 'multer';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to upload file to Supabase storage
const uploadToSupabase = async (file, bucket, username) => {
  const fileExt = file.originalname.split('.').pop();
  const originalName = file.originalname.replace(/\.[^/.]+$/, ''); // Remove extension
  const fileName = `${username}_${originalName}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true // Allow overwriting if same filename exists
    });

  if (error) throw error;

  return fileName; // Return just the filename, not the full URL
};

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, up."UserID" as "ownerId", u."UserID", acc."AccUserName" as owner_username 
       FROM "PET" p 
       LEFT JOIN "USERPETS" up ON p."PetID" = up."PetID" 
       LEFT JOIN "USER" u ON up."UserID" = u."UserID"
       LEFT JOIN "ACCOUNT" acc ON u."AccID" = acc."AccID"
       WHERE p."PetAvailable" = true AND p."PetRegType" = 'Adoption'`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/my-pets', authenticateToken, async (req, res) => {
  try {
    console.log('User from token:', req.user);
    
    const userResult = await pool.query('SELECT "UserID" FROM "USER" WHERE "AccID" = $1', [req.user.accId]);
    
    console.log('User query result:', userResult.rows);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const result = await pool.query(
      `SELECT p.*, acc."AccUserName" as owner_username 
       FROM "PET" p 
       JOIN "USERPETS" up ON p."PetID" = up."PetID" 
       JOIN "USER" u ON up."UserID" = u."UserID"
       JOIN "ACCOUNT" acc ON u."AccID" = acc."AccID"
       WHERE up."UserID" = $1`,
      [userResult.rows[0].UserID]
    );
    
    console.log('Pets query result:', result.rows);
    
    res.json(result.rows);
  } catch (error) {
    console.error('MY PETS ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, up."UserID" as "ownerId", u."UserName" as owner_name, acc."AccUserName" as owner_username 
       FROM "PET" p 
       LEFT JOIN "USERPETS" up ON p."PetID" = up."PetID" 
       LEFT JOIN "USER" u ON up."UserID" = u."UserID"
       LEFT JOIN "ACCOUNT" acc ON u."AccID" = acc."AccID"
       WHERE p."PetID" = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  const { petName, petBDay, petSpecie, petBreed, petMarkings, petGender, petDetails, petImg, petRegType } = req.body;
  
  try {
    console.log('Creating pet with data:', { petName, petBDay, petSpecie, petBreed, petMarkings, petGender, petDetails, petRegType });
    console.log('User from token:', req.user);
    
    // Get username for file naming
    const accountResult = await pool.query('SELECT "AccUserName" FROM "ACCOUNT" WHERE "AccID" = $1', [req.user.accId]);
    const username = accountResult.rows[0]?.AccUserName || 'user';
    
    let imageUrl = petImg;
    if (req.file) {
      imageUrl = await uploadToSupabase(req.file, 'pet-images', username);
    }

    const petResult = await pool.query(
      'INSERT INTO "PET" ("PetName", "PetBDay", "PetSpecie", "PetBreed", "PetMarkings", "PetGender", "PetDetails", "PetImg", "PetRegType") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [petName, petBDay, petSpecie, petBreed, petMarkings, petGender, petDetails, imageUrl, petRegType]
    );

    console.log('Pet created:', petResult.rows[0]);

    const userResult = await pool.query('SELECT "UserID" FROM "USER" WHERE "AccID" = $1', [req.user.accId]);
    
    console.log('User query result:', userResult.rows);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await pool.query(
      'INSERT INTO "USERPETS" ("UserID", "PetID") VALUES ($1, $2)',
      [userResult.rows[0].UserID, petResult.rows[0].PetID]
    );

    res.status(201).json(petResult.rows[0]);
  } catch (error) {
    console.error('CREATE PET ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  const { petName, petBDay, petSpecie, petBreed, petMarkings, petGender, petDetails, petImg } = req.body;
  
  try {
    // Get username for file naming
    const accountResult = await pool.query('SELECT "AccUserName" FROM "ACCOUNT" WHERE "AccID" = $1', [req.user.accId]);
    const username = accountResult.rows[0]?.AccUserName || 'user';
    
    let imageUrl = petImg;
    if (req.file) {
      imageUrl = await uploadToSupabase(req.file, 'pet-images', username);
    }

    const result = await pool.query(
      'UPDATE "PET" SET "PetName" = $1, "PetBDay" = $2, "PetSpecie" = $3, "PetBreed" = $4, "PetMarkings" = $5, "PetGender" = $6, "PetDetails" = $7, "PetImg" = $8 WHERE "PetID" = $9 RETURNING *',
      [petName, petBDay, petSpecie, petBreed, petMarkings, petGender, petDetails, imageUrl, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('UPDATE PET ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM "USERPETS" WHERE "PetID" = $1', [req.params.id]);
    await pool.query('DELETE FROM "PET" WHERE "PetID" = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
