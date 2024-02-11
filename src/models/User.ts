import mongoose from "mongoose";
const Schema = mongoose.Schema;

mongoose.connect(`mongodb+srv://${process.env.MONGODB}&w=majority`);

export const UserSchema = new Schema({
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
  commentAfterSubs: {
    type: String,
    default: null,
  },
  timeCooldownTravis: {
    type: Number,
    default: null,
    unique: true,
  },
  timeCooldownOg1ii: {
    type: String,
    default: null,
    unique: true,
  },
  endTime: {
    type: Number,
    default: null,
    unique: true,
  },
  puuid: {
    type: String,
    default: null,
    unique: true,
  },
  riotAccountList: {
    type: Array,
    default: [],
  },
  activeRiotAccount: {
    type: {
      name: String,
      server: String,
      date: Number,
      puuid: String,
      id: String,
      lol_puuid: String,
      lol_id: String,
      isLol: Boolean,
    },
    default: null,
  },
  matchList: {
    type: Array,
    default: [],
  },
  rollID: {
    type: String,
    default: null,
  },
  banID: {
    type: String,
    default: null,
  },
  slotsID: {
    type: Array,
    default: null,
  },
  wheelwinners: {
    type: Array,
    default: [],
  },
  commandSwitch: {
    type: { weather: Boolean, tft: Boolean, chess: Boolean, wordle: Boolean, slots: Boolean, song: Boolean },
    default: { weather: true, tft: true, chess: true, wordle: true, slots: true, song: true },
  },
});

mongoose.model("user", UserSchema);
