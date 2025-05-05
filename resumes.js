// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

require('dotenv').config();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/upload', require('./routes/upload'));
app.use('/api/form', require('./routes/form'));
app.use('/api/generate', require('./routes/generate'));
app.use('/api/resumes', require('./routes/resumes'));
app.use('/api/checkout', require('./routes/stripe'));
app.use('/api/webhook', require('./routes/webhook'));

// Static PDF serve
app.use('/resumes', express.static(path.join(__dirname, 'storage', 'resumes')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// routes/upload.js
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
  const ext = path.extname(req.file.originalname).toLowerCase();
  const rawText = fs.readFileSync(req.file.path, 'utf-8'); // Replace with parser if PDF/DOCX
  fs.unlinkSync(req.file.path);

  const data = { id, source: 'upload', text: rawText };
  const outPath = path.join(__dirname, '..', 'storage', 'resumes', `${id}.json`);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  res.json({ message: 'Parsed and saved', id });
});

module.exports = router;

// routes/form.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

router.post('/', (req, res) => {
  const id = uuidv4();
  const formData = { id, source: 'form', ...req.body };
  const outPath = path.join(__dirname, '..', 'storage', 'resumes', `${id}.json`);

  try {
    fs.writeFileSync(outPath, JSON.stringify(formData, null, 2));
    res.json({ message: 'Form data saved', id });
  } catch (error) {
    console.error('Form save error:', error);
    res.status(500).json({ error: 'Failed to save form data' });
  }
});

module.exports = router;

// routes/generate.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { generateResume } = require('../utils/openai');
const { createPDF } = require('../utils/pdf');

router.post('/', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing ID' });

  const filePath = path.join(__dirname, '..', 'storage', 'resumes', `${id}.json`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Data not found' });

  const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const resumeText = await generateResume(JSON.stringify(userData));
  const pdfPath = path.join(__dirname, '..', 'storage', 'resumes', `${id}.pdf`);
  await createPDF(resumeText, pdfPath);

  res.json({ message: 'Resume generated', id, pdfPath: `/resumes/${id}.pdf` });
});

module.exports = router;

// routes/resumes.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

router.get('/', async (req, res) => {
  const dirPath = path.join(__dirname, '..', 'storage', 'resumes');
  const files = fs.readdirSync(dirPath);
  const results = [];

  files.forEach((file) => {
    if (file.endsWith('.pdf')) {
      const id = file.replace('.pdf', '');
      results.push({ id, pdfPath: `/resumes/${file}` });
    }
  });

  res.json(results);
});

module.exports = router;
