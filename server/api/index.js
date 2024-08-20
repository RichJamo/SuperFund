import { promises as fs } from 'fs';
import path from 'path';

const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins. Adjust as needed for better security.
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

const handler = async (req, res) => {
  const filePath = path.join(process.cwd(), 'data.json'); // Adjust this path if needed
  console.log('filePath', filePath);
  if (req.method === 'GET') {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      res.status(200).json(JSON.parse(data));
    } catch (error) {
      res.status(500).send('Error reading data file.');
    }
  } else if (req.method === 'POST') {
    try {
      const { username, walletAddress, managerAddress } = req.body;
      if (!username || !walletAddress) {
        return res.status(400).send('Username and walletAddress are required.');
      }
      const data = await fs.readFile(filePath, 'utf-8');
      const users = JSON.parse(data);
      users[username] = { walletAddress, managerAddress };
      await fs.writeFile(filePath, JSON.stringify(users, null, 2));
      res.status(201).send('User added.');
    } catch (error) {
      res.status(500).send('Error handling request.');
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

// Wrap your handler with the CORS function
export default allowCors(handler);
