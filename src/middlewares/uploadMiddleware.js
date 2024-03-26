const multer = require("multer");
const fs = require("fs");

// Configure multer storage and file name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./docs");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// Create multer upload instance
const upload = multer({ storage: storage });

const uploadMiddleware = (req, res, next) => {
  upload.array("files", 20)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const files = req.files;
    const errors = [];

    console.log(files);

    files.forEach((file) => {
      const allowedTypes = ["application/pdf"];

      if (!allowedTypes.includes(file.mimetype)) {
        errors.push(`Invalid file type: ${file.originalname}`);
      }
    });

    if (errors.length > 0) {
      files.forEach((file) => {
        fs.unlinkSync(file.path);
      });

      return res.status(400).json({ errors });
    }

    req.files = files;
    next();
  });
};

module.exports = uploadMiddleware;
