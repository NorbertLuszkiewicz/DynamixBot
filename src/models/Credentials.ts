import mongoose from "mongoose";
const Schema = mongoose.Schema;

mongoose.connect(`mongodb+srv://${process.env.MONGODB}&w=majority`);

export const CredentialsSchema = new Schema({
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
  kickAccessToken: {
    type: String,
    default: null,
  },
  kickRefreshToken: {
    type: String,
    default: null,
  },
  kickNick: {
    type: String,
    default: null,
  },
  kickID: {
    type: String,
    default: null,
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

mongoose.model("credentials", CredentialsSchema);
