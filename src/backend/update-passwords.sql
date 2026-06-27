-- Run this SQL in your Supabase SQL Editor to update passwords
-- These are bcrypt hashed versions of the passwords

-- juan@email.com - password: password123
UPDATE "ACCOUNT" 
SET "AccPass" = '$2a$10$OZ4hx4EZRgMUbjK7dW5yNeDz1sJCQ6KHeKQuLJeqNA7WJ.rLMRQAm'
WHERE "AccEmail" = 'juan@email.com';

-- maria@email.com - password: password123  
UPDATE "ACCOUNT"
SET "AccPass" = '$2a$10$OZ4hx4EZRgMUbjK7dW5yNeDz1sJCQ6KHeKQuLJeqNA7WJ.rLMRQAm'
WHERE "AccEmail" = 'maria@email.com';

-- rosa@shelter.com - password: admin123
UPDATE "ACCOUNT"
SET "AccPass" = '$2a$10$XV0w6RI6QH11G5h8ZNjOsefMFXcxnkhcAshBVRxcJVppHc33EQc12'
WHERE "AccEmail" = 'rosa@shelter.com';

-- dra.santos@shelter.com - password: vet123
UPDATE "ACCOUNT"
SET "AccPass" = '$2a$10$fybriRSpcrlrqdIVisUQ5Onkl9ZuMhSJ5EWqAp8BYKPongw7Tiheq'
WHERE "AccEmail" = 'dra.santos@shelter.com';
