import mongoose, { mongo, Mongoose, setDriver } from "mongoose"

const MusicModel = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    artistId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    artist: {
        type: String,
        required: true
    },
    musicKey: {
        type: String,
        required: true
    },
    coverImageKey: {
        type: String,
        required: true
    }
}, { timestamps: true })

const Music = mongoose.model("Music", MusicModel);
export default Music;