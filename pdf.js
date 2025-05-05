// utils/openai.js
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function generateResume(jsonData) {
  const prompt = `Generate a clean, professional resume based on the following data:

  ${jsonData}

  Format it using consistent headings, bullet points, and concise descriptions. No cover letter, only the resume content.`;

  const completion = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1200,
  });

  return completion.data.choices[0].message.content;
}

module.exports = { generateResume };

// utils/pdf.js
const fs = require('fs');
const PDFDocument = require('pdfkit');

async function createPDF(text, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);
    doc.font('Times-Roman').fontSize(12).text(text, {
      align: 'left',
      lineGap: 4,
    });

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}

module.exports = { createPDF };
