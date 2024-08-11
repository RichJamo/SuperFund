const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 4000; // You can change this port if needed
const dataFilePath = path.join(__dirname, 'data.json');

app.use(cors());

app.use(bodyParser.json());

// Get all usernames
app.get('/api/users', (req, res) => {
  fs.readFile(dataFilePath, (err, data) => {
    if (err) return res.status(500).send('Error reading data file.');
    res.json(JSON.parse(data));
  });
});

// Add a new user
app.post('/api/users', (req, res) => {
  const { username, address } = req.body;
  console.log('Received data:', req.body); // Log the request body

  if (!username || !address) {
    return res.status(400).send('Username and address are required.');
  }

  fs.readFile(dataFilePath, (err, data) => {
    if (err) return res.status(500).send('Error reading data file.');

    const users = JSON.parse(data);
    users[username] = address;

    fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), err => {
      if (err) return res.status(500).send('Error writing to data file.');
      res.status(201).send('User added.');
    });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
