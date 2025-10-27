const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '..', 'tmp')),
  filename: (_req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

module.exports = multer({ storage });
