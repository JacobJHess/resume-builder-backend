// generate.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const { generateResume } = require('./utils/openai');
const { createPDF } = require('./utils/pdf');

router.post('/', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing ID' });

  const filePath = path.join(__dirname, 'storage', 'resumes', `${id}.json`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Data not found' });

  const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  try {
    const resumeText = await generateResume(JSON.stringify(userData));
    const pdfPath = path.join(__dirname, 'storage', 'resumes', `${id}.pdf`);
    await createPDF(resumeText, pdfPath);
    res.json({ message: 'Resume generated', id, pdfPath: `/resumes/${id}.pdf` });
  } catch (error) {
    console.error('Resume generation failed:', error);
    res.status(500).json({ error: 'Failed to generate resume' });
  }
});

module.exports = router;
