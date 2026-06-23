// User.js
import { query } from '../config/db.js';
import bcrypt from 'bcrypt';

// 1. Function to create the table (you can run this once on startup)
export const createUserTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      current_streak INTEGER DEFAULT 0,
      last_streak_date DATE
    );
  `;
  await query(sql);
  console.log('Users table ready.');
};

// 2. Function to register a new user
export const registerUser = async (name, email, rawPassword) => {
  // Hash the password manually before it goes to the DB
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

  const sql = `
    INSERT INTO users (name, email, password) 
    VALUES ($1, $2, $3) 
    RETURNING user_id, name, email;
  `;
  
  // Use parameterized queries to prevent SQL injection
  const { rows } = await query(sql, [name, email, hashedPassword]);
  return rows[0]; // Returns the newly created user without the password
};

// 3. Function to verify login
export const verifyUser = async (email, rawPassword) => {
  const sql = `SELECT * FROM users WHERE email = $1;`;
  const { rows } = await query(sql, [email]);
  
  if (rows.length === 0) return null; // User not found
  
  const user = rows[0];
  const isValid = await bcrypt.compare(rawPassword, user.password);
  
  return isValid ? user : null;
};

// Function to check if a user exists by email
export const findUserByEmail = async (email) => {
  const sql = `SELECT user_id, email FROM users WHERE email = $1;`;
  const { rows } = await query(sql, [email]);
  
  // Return the user if found, otherwise return null
  return rows.length > 0 ? rows[0] : null; 
};

// Function to find a user by ID (for session validation)
export const findUserById = async (userId) => {
  const sql = `SELECT user_id, name, email, current_streak FROM users WHERE user_id = $1;`;
  const { rows } = await query(sql, [userId]);

  console.log('findUserById result:', rows); // Debugging line to check the query result
  return rows.length > 0 ? rows[0] : null;
};

// Function to update the user's current streak and last streak date
export const updateUserStreak = async (userId) => {
  const sql = `
    UPDATE users
    SET
      current_streak = CASE
        WHEN last_streak_date = CURRENT_DATE THEN current_streak

        WHEN last_streak_date = CURRENT_DATE - INTERVAL '1 day'
          THEN current_streak + 1

        ELSE 1
      END,

      last_streak_date = CURRENT_DATE

    WHERE user_id = $1
    RETURNING current_streak;
  `;

  const { rows } = await query(sql, [userId]);
  return rows[0];
};