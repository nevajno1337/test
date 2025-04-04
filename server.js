const express = require('express');
const path = require('path');
const backend = require('./backend/index');
const { PORT = 3000 } = process.env;

const app = express();

// API Routes
app.use('/api', backend);

// Static Files (Frontend)
app.use(express.static(path.join(__dirname, 'frontend/dist')));
app.use('/assets', express.static(path.join(__dirname, 'frontend/dist/assets')));

// Fallback for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});