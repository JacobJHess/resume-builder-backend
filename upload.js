// upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const id = uuidv4();
  const rawText = fs.readFileSync(req.file.path, 'utf-8'); // Replace this with real parsing later
  fs.unlinkSync(req.file.path);

  const data = { id, source: 'upload', text: rawText };
  const outPath = path.join(__dirname, 'storage', 'resumes', `${id}.json`);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));

  res.json({ message: 'Resume saved', id });
});

module.exports = router;
