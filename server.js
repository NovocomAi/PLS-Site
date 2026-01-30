const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// SPA routing - all requests go to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Server error');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ PLS CRM Server running on http://77.42.79.205:${PORT}/`);
  console.log(`✅ Ready for production`);
});
