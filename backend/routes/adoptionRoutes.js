import express from 'express';
import multer from 'multer';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import { createNotification, createNotificationsForVets } from '../utils/notificationHelper.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to upload file to Supabase storage
const uploadToSupabase = async (file, bucket) => {
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrl;
};

// Create adoption request
router.post('/', authenticateToken, upload.single('waiver'), async (req, res) => {
  const { userPetId, message } = req.body;
  
  try {
    console.log('Adoption request body:', req.body);
    console.log('User from token:', req.user);
    
    const userResult = await pool.query('SELECT "UserID", "UserName" FROM "USER" WHERE "AccID" = $1', [req.user.accId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('Adopter UserID:', userResult.rows[0].UserID);
    
    // Get the UserPetID from USERPETS table based on the PetID
    const userPetResult = await pool.query(
      `SELECT up."UserPetID", owner."AccID" as owner_acc_id, p."PetName"
       FROM "USERPETS" up
       JOIN "USER" owner ON up."UserID" = owner."UserID"
       JOIN "PET" p ON up."PetID" = p."PetID"
       WHERE up."PetID" = $1`,
      [userPetId]
    );
    
    if (userPetResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pet not found in USERPETS table' });
    }
    
    const userPetID = userPetResult.rows[0].UserPetID;
    console.log('UserPetID:', userPetID);
    
    let waiverUrl = null;
    if (req.file) {
      waiverUrl = await uploadToSupabase(req.file, 'adoption-waivers');
    }
    
    const result = await pool.query(
      'INSERT INTO "ADOPTION" ("UserID", "UserPetsID", "AdoptionWaiver") VALUES ($1, $2, $3) RETURNING *',
      [userResult.rows[0].UserID, userPetID, waiverUrl]
    );
    
    console.log('Adoption created:', result.rows[0]);

    await createNotification({
      accId: userPetResult.rows[0].owner_acc_id,
      title: 'New adoption request',
      message: `${userResult.rows[0].UserName} requested to adopt ${userPetResult.rows[0].PetName}.`,
      type: 'adoption'
    });
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Adoption creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload waiver to existing adoption
router.post('/:id/waiver', authenticateToken, upload.single('waiver'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const waiverUrl = await uploadToSupabase(req.file, 'adoption-waivers');
    
    const result = await pool.query(
      'UPDATE "ADOPTION" SET "AdoptionWaiver" = $1 WHERE "AdoptID" = $2 RETURNING *',
      [waiverUrl, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Adoption not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my adoption requests (as adopter)
router.get('/my-requests', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT "UserID" FROM "USER" WHERE "AccID" = $1', [req.user.accId]);
    
    const result = await pool.query(
      `SELECT a.*, 
              p."PetName", p."PetImg", p."PetBreed",
              up."PetID",
              owner."UserID" as "OwnerUserID",
              owner."UserName" as owner_name 
       FROM "ADOPTION" a 
       JOIN "USERPETS" up ON a."UserPetsID" = up."UserPetID" 
       JOIN "PET" p ON up."PetID" = p."PetID" 
       JOIN "USER" owner ON up."UserID" = owner."UserID" 
       WHERE a."UserID" = $1
       ORDER BY a."AdoptReqDate" DESC`,
      [userResult.rows[0].UserID]
    );
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get incoming adoption requests (as pet owner)
router.get('/incoming', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT "UserID" FROM "USER" WHERE "AccID" = $1', [req.user.accId]);
    
    const result = await pool.query(
      `SELECT a.*, 
              p."PetName", p."PetImg", p."PetBreed",
              up."PetID",
              adopter."UserID" as "AdopterUserID",
              adopter."UserName" as adopter_name, 
              acc."AccEmail" as adopter_email, 
              acc."AccPhoneNum" as adopter_phone
       FROM "ADOPTION" a 
       JOIN "USERPETS" up ON a."UserPetsID" = up."UserPetID" 
       JOIN "PET" p ON up."PetID" = p."PetID" 
       JOIN "USER" adopter ON a."UserID" = adopter."UserID"
       JOIN "ACCOUNT" acc ON adopter."AccID" = acc."AccID"
       WHERE up."UserID" = $1
       ORDER BY a."AdoptReqDate" DESC`,
      [userResult.rows[0].UserID]
    );
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve adoption
router.put('/:id/approve', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE "ADOPTION" SET "AdoptStatus" = $1
       WHERE "AdoptID" = $2
       RETURNING *`,
      ['Approved', req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Adoption not found' });
    }
    const details = await pool.query(
      `SELECT adopter."AccID", p."PetName"
       FROM "ADOPTION" a
       JOIN "USER" adopter ON a."UserID" = adopter."UserID"
       JOIN "USERPETS" up ON a."UserPetsID" = up."UserPetID"
       JOIN "PET" p ON up."PetID" = p."PetID"
       WHERE a."AdoptID" = $1`,
      [req.params.id]
    );

    if (details.rows.length > 0) {
      await createNotification({
        accId: details.rows[0].AccID,
        title: 'Adoption request approved',
        message: `Your adoption request for ${details.rows[0].PetName} was approved.`,
        type: 'adoption'
      });
      // Notify vet staff that an adoption is ready for processing
      await createNotificationsForVets({
        title: 'Adoption approved — awaiting vet processing',
        message: `An adoption for ${details.rows[0].PetName} has been approved and is ready for vet waiver processing.`,
        type: 'adoption'
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject adoption
router.put('/:id/reject', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE "ADOPTION" SET "AdoptStatus" = $1 WHERE "AdoptID" = $2 RETURNING *',
      ['Rejected', req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Adoption not found' });
    }
    const details = await pool.query(
      `SELECT adopter."AccID", p."PetName"
       FROM "ADOPTION" a
       JOIN "USER" adopter ON a."UserID" = adopter."UserID"
       JOIN "USERPETS" up ON a."UserPetsID" = up."UserPetID"
       JOIN "PET" p ON up."PetID" = p."PetID"
       WHERE a."AdoptID" = $1`,
      [req.params.id]
    );

    if (details.rows.length > 0) {
      await createNotification({
        accId: details.rows[0].AccID,
        title: 'Adoption request rejected',
        message: `Your adoption request for ${details.rows[0].PetName} was rejected.`,
        type: 'adoption'
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel adoption
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE "ADOPTION" SET "AdoptStatus" = $1 WHERE "AdoptID" = $2 RETURNING *',
      ['Cancelled', req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Adoption not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete adoption
router.put('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE "ADOPTION" SET "AdoptStatus" = $1 WHERE "AdoptID" = $2 RETURNING *',
      ['Completed', req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Adoption not found' });
    }
    const details = await pool.query(
      `SELECT adopter."AccID", p."PetName"
       FROM "ADOPTION" a
       JOIN "USER" adopter ON a."UserID" = adopter."UserID"
       JOIN "USERPETS" up ON a."UserPetsID" = up."UserPetID"
       JOIN "PET" p ON up."PetID" = p."PetID"
       WHERE a."AdoptID" = $1`,
      [req.params.id]
    );

    if (details.rows.length > 0) {
      await createNotification({
        accId: details.rows[0].AccID,
        title: 'Adoption completed',
        message: `The adoption process for ${details.rows[0].PetName} was completed.`,
        type: 'adoption'
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
