import multer from "multer";

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Export middleware
const uploadMiddleware = multer({ storage }).single("file"); // "file" must match frontend FormData
export default uploadMiddleware;
