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
