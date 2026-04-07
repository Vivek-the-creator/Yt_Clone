import express from "express";
import multer from "multer";
import storage from "../config/multerStorage.js";
import {
  signup,
  login,
  logout,
  getAuthenticatedUser,
  updateUser,
  deleteUser,
  toggleSubscribe,
  getWatchHistory,
} from "../controllers/user.controller.js";

import { isLoggedIn } from "../middleware/isLoggedIn.js";

const router = express.Router();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

router.post("/signup", upload.single("profileImage"), signup);
router.post("/login", login);

router.get("/authenticate", isLoggedIn, getAuthenticatedUser);
router.post("/logout", isLoggedIn, logout);
router.put(
  "/:id",
  isLoggedIn,
  upload.fields([{ name: "profileImage", maxCount: 1 }]),
  updateUser
);
router.delete("/:id", isLoggedIn, deleteUser);
router.post("/:id/subscribe", isLoggedIn, toggleSubscribe);
router.get("/history/watch", isLoggedIn, getWatchHistory);


export default router;
