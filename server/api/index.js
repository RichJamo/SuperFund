require('dotenv').config();
const { createPool } = require('@vercel/postgres');

// Allow CORS for serverless functions
const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://superfund.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

const handler = async (req, res) => {
  console.log('POSTGRES_URL:', process.env.POSTGRES_URL);
  const pool = createPool({
    connectionString: process.env.POSTGRES_URL,
    });
  if (req.method === 'GET') {
    try {
      const { rows } = await pool.sql`SELECT * FROM users`;
      res.status(200).json(rows);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: 'Error fetching users' });
    }
  } else if (req.method === 'POST') {
    const { username, walletAddress, managerAddress } = req.body;
    try {
      await pool.sql`
        INSERT INTO users (username, wallet_address, manager_address)
        VALUES (${username}, ${walletAddress}, ${managerAddress})
        ON CONFLICT (username) DO NOTHING
      `;
      res.status(201).json({ message: 'User added successfully' });
    } catch (error) {
      console.error("Error adding new user:", error);
      res.status(500).json({ error: 'Error adding user' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

module.exports = allowCors(handler);
