"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialsSchema = void 0;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.connect(`mongodb+srv://${process.env.MONGODB}&w=majority`);
exports.CredentialsSchema = new Schema({
    streamer: {
        type: String,
        required: true,
        unique: true,
    },
    twitchAccessToken: {
        type: String,
        required: true,
    },
    twitchRefreshToken: {
        type: String,
        required: true,
    },
    spotifyRefreshToken: {
        type: String,
        default: null,
    },
    spotifyAccessToken: {
        type: String,
        default: null,
    },
    device: {
        type: String,
        default: null,
    },
    code: {
        type: String,
        default: null,
    },
    clientSongRequestID: {
        type: String,
        default: null,
    },
    clientSongRequestSecret: {
        type: String,
        default: null,
    },
});
mongoose.model("credentials", exports.CredentialsSchema);
//# sourceMappingURL=Credentials.js.map