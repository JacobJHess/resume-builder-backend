// form.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.post('/', (req, res) => {
  const id = uuidv4();
  const formData = { id, source: 'form', ...req.body };

  const outPath = path.join(__dirname, 'storage', 'resumes', `${id}.json`);
  try {
    fs.writeFileSync(outPath, JSON.stringify(formData, null, 2));
    res.json({ message: 'Form data saved', id });
  } catch (error) {
    console.error('Form save error:', error);
    res.status(500).json({ error: 'Failed to save form data' });
  }
});

module.exports = router;
