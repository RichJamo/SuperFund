require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createPool } = require('@vercel/postgres');

const app = express();
app.use(cors());
app.use(express.json());

console.log(process.env.POSTGRES_URL);
// Create a connection pool using environment variables
const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

// Endpoint to fetch user data
app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.sql`SELECT * FROM users`;
    res.json(rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Endpoint to add new user data
app.post('/api/users', async (req, res) => {
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
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
