import express from "express";
const router = express.Router();
import * as MusicController from "../controllers/music.controller.js";
import * as authMiddleware from "../middlewares/auth.middleware.js";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post(
  "/upload",
  authMiddleware.authArtistMiddleware,
  upload.fields([
    { name: "music", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  MusicController.uploadMusic,
);

router.get(
  "/artist-musics",
  authMiddleware.authArtistMiddleware,
  MusicController.getArtistMusics,
);
export default router;
