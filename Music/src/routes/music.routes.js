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
  "/",
  authMiddleware.authUserMiddleware,
  MusicController.getAllMusics,
);

router.get(
  "/artist-musics",
  authMiddleware.authArtistMiddleware,
  MusicController.getArtistMusics,
);

router.post(
  "/playlist",
  authMiddleware.authArtistMiddleware,
  MusicController.createPlaylist,
);

router.get(
  "/playlist/artist",
  authMiddleware.authArtistMiddleware,
  MusicController.getArtistPlaylists,
);

router.get(
  "/playlist",
  authMiddleware.authUserMiddleware,
  MusicController.getPlaylists,
);

router.get(
  "/playlist/:id",
  authMiddleware.authUserMiddleware,
  MusicController.getPlaylistById,
);

router.get(
  "/:id",
  authMiddleware.authUserMiddleware,
  MusicController.getMusicById,
);

export default router;
