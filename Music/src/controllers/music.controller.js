import { uploadFile, getPresignedUrl } from "../services/storage.server.js";
import Music from "../models/music.model.js";
import Playlist from "../models/playlist.model.js";

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

export async function getMusicById(req, res) {
  try {
    const { id } = req.params;
    const music = await Music.findById(id).lean();

    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }

    music.musicKey = await getPresignedUrl(music.musicKey);
    music.coverImageKey = await getPresignedUrl(music.coverImageKey);

    return res.status(200).json({
      message: "Music fetched successfully",
      music,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllMusics(req, res) {
  try {
    const { skip = 0, limit = 10 } = req.query;

    const skipCount = parseInt(skip);
    const limitCount = parseInt(limit);

    if (isNaN(skipCount) || isNaN(limitCount)) {
      return res.status(400).json({ message: "Invalid skip or limit" });
    }

    const musicsDocs = await Music.find()
      .skip(skipCount)
      .limit(limitCount)
      .lean();

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
    console.log(error.data.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function createPlaylist(req, res) {
  const { title, musics } = req.body;

  try {
    const playlist = await Playlist.create({
      title,
      artistId: req.user.id,
      artist: req.user.fullname.firstName + " " + req.user.fullname.lastName,
      musics,
    });

    return res.status(201).json({
      message: "Playlist created successfully",
      playlist,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
}

export async function getArtistPlaylists(req, res) {
  try {
    const playlists = await Playlist.find({ artistId: req.user.id }).lean();

    return res.status(200).json({
      message: "Playlists fetched successfully",
      playlists,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
}

export async function getPlaylists(req, res) {
  try {
    const playlists = await Playlist.find({}).lean();

    return res.status(200).json({
      message: "Playlists fetched successfully",
      playlists,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
}

export async function getPlaylistById(req, res) {
  try {
    const { id } = req.params;
    const playlist = await Playlist.findById(id);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    const musics = [];

    for (let musicId of playlist.musics) {
      const music = await Music.findById(musicId).lean();

      if (music) {
        music.musicKey = await getPresignedUrl(music.musicKey);
        music.coverImageKey = await getPresignedUrl(music.coverImageKey);
        musics.push(music);
      }
    }

    playlist.musics = musics;

    return res.status(200).json({
      message: "Playlist fetched successfully",
      playlist,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
}
