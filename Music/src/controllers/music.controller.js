import { uploadFile, getPresignedUrl } from "../services/storage.server.js";
import Music from "../models/music.model.js";

export async function uploadMusic(req, res) {
  try {
    const musicFile = req.files["music"][0];
    const coverImageFile = req.files["coverImage"][0];

    const musicKey = await uploadFile(musicFile);
    const coverImageKey = await uploadFile(coverImageFile);

    const music = await Music.create({
      title: req.body.title,
      artist: req.user.fullname.firstName + " " + req.user.fullname.lastName,
      artistId: req.user.id,
      musicKey,
      coverImageKey,
    });

    return res.status(201).json({
      message: "Music uploaded successfully",
      music,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
}

export async function getArtistMusics(req, res) {
  try {
    const musicsDocs = await Music.find({ artistId: req.user.id }).lean();

    const musics = [];

    for (let music of musicsDocs) {
      music.musicKey = await getPresignedUrl(music.musicKey);
      music.coverImageKey = await getPresignedUrl(music.coverImageKey);
      musics.push(music);
    }

    return res.status(200).json({
      message: "Musics fetched successfully",
      musics,
    });
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
