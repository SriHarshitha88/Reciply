const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
require('dotenv').config(); // load env variables

const app = express();
const port = process.env.PORT || 3000;

// Setup multer for in-memory file storage
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// POST route to scan receipt image
app.post('/scan-receipt', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const processedImageBuffer = await sharp(req.file.buffer)
      .greyscale()
      .normalize()
      .sharpen()
      .toBuffer();

    const result = await Tesseract.recognize(
      processedImageBuffer,
      'eng',
      { logger: m => console.log(m) }
    );

    const extractedData = processReceiptText(result.data.text);

    res.json({
      success: true,
      text: result.data.text,
      extractedData
    });
  } catch (error) {
    console.error('OCR error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process receipt'
    });
  }
});

function processReceiptText(text) {
  const lines = text.split('\n').filter(line => line.trim());
  const merchantName = lines[0];

  const datePattern = /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/;
  const dateMatch = text.match(datePattern);
  const date = dateMatch ? dateMatch[0] : null;

  const totalPattern = /total\s*[\$\£\€]?\s*(\d+[\.,]\d{2})/i;
  const totalMatch = text.match(totalPattern);
  const totalAmount = totalMatch ? totalMatch[1] : null;

  const items = [];
  const itemPattern = /([A-Za-z\s]+)\s+(\d+[\.,]\d{2})/g;
  let itemMatch;
  while ((itemMatch = itemPattern.exec(text)) !== null) {
    items.push({
      description: itemMatch[1].trim(),
      amount: itemMatch[2]
    });
  }

  return {
    merchantName,
    date,
    totalAmount,
    items
  };
}

app.listen(port, () => {
  console.log(`✅ OCR service running on port ${port}`);
});
