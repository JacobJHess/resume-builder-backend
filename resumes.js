// resumes.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const resumePath = path.join(__dirname, 'storage', 'resumes', `${id}.pdf`);

  if (!fs.existsSync(resumePath)) {
    return res.status(404).json({ error: 'Resume not found' });
  }

  res.sendFile(resumePath);
});

module.exports = router;
