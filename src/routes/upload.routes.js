const express = require("express");
const multer = require("multer");
const router = express.Router();
const uploadController = require("../controllers/upload.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."));
    }
  },
});

router.use(authMiddleware);

router.post(
  "/persons/:personId/avatar",
  upload.single("avatar"),
  uploadController.uploadPersonAvatar
);

router.delete(
  "/persons/:personId/avatar",
  uploadController.deletePersonAvatar
);

module.exports = router;
