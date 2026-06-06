const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');
const routes = require('./routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Base route
app.get('/', (req, res) => {
  res.send('Hotel Management API is running.');
});

// Initialize DB and start server
async function startServer() {
  await db.initDb();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
