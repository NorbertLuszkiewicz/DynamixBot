"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SongSchema = void 0;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.connect(`mongodb+srv://${process.env.MONGODB}&w=majority`);
exports.SongSchema = new Schema({
    streamer: {
        type: String,
        required: true,
        unique: true,
    },
    addSongID: {
        type: String,
        default: null,
    },
    skipSongID: {
        type: String,
        default: null,
    },
    volumeSongID: {
        type: {
            id: String,
            max: Number,
            min: Number,
            maxSR: Number,
            minSR: Number,
            time: Number,
        },
        default: null,
    },
    timeoutVolume: {
        type: Schema.Types.Mixed,
        default: null,
    },
    maxVolumeTime: {
        type: Number,
        default: null,
    },
    endTime: {
        type: Number,
        default: null,
        unique: true,
    },
});
mongoose.model("song", exports.SongSchema);
//# sourceMappingURL=Song.js.map