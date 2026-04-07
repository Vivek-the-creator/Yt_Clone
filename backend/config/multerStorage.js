import multer from "multer";
import path from "path";
import {
  ensureStorageDirs,
  THUMBNAIL_STORAGE_DIR,
  VIDEO_STORAGE_DIR,
} from "../services/video.service.js";

ensureStorageDirs();

// Simple filename sanitizer
const sanitize = (str) => str.replace(/[^a-zA-Z0-9_-]/g, "_");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destination =
      file.fieldname === "thumbnailImage"
        ? THUMBNAIL_STORAGE_DIR
        : VIDEO_STORAGE_DIR;

    cb(null, destination);
  },
  filename: (req, file, cb) => {
    const name = sanitize(path.parse(file.originalname).name);
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}-${name}${ext}`;
    cb(null, filename);
  },
});

export default storage;
