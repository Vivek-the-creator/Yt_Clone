import express from "express";
import multer from "multer";
import storage from "../config/multerStorage.js";
import { isLoggedIn } from "../middleware/isLoggedIn.js";

import {
  uploadVideo,
  getAllVideo,
  getPopularVideos,
  getVideoById,
  toggleLikeVideo,
  toggleBookmarkVideo,
  updateVideoAsViewed,
  addCommentToVideo,
  deleteComment,
} from "../controllers/video.controller.js"

const router = express.Router();

const upload = multer({
  storage,
  limits: {
    fileSize: 300 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "videoFile") {
      if (file.mimetype !== "video/mp4") {
        return cb(new Error("Only MP4 videos are allowed"));
      }
      return cb(null, true);
    }

    if (file.fieldname === "thumbnailImage") {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Thumbnail must be an image"));
      }
      return cb(null, true);
    }

    cb(new Error("Unexpected upload field"));
  },
});

const uploadFields = upload.fields([
  { name: "thumbnailImage", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
  { name: "videoFile", maxCount: 1 },
]);

router.post(
  "/upload",
  isLoggedIn,
  uploadFields,
  uploadVideo
);
router.post("/", isLoggedIn, uploadFields, uploadVideo);

router.get("/", getAllVideo);
router.get("/popular-videos", getPopularVideos);
router.get("/:videoId", getVideoById);
router.put("/:videoId/like", isLoggedIn, toggleLikeVideo);
router.put("/:videoId/bookmark", isLoggedIn, toggleBookmarkVideo);
router.put("/:videoId/viewed", updateVideoAsViewed);
router.post("/:videoId/comment", isLoggedIn, addCommentToVideo);
router.delete("/comment/:commentId", isLoggedIn, deleteComment);

export default router;
