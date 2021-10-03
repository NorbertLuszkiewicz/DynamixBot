const mongoose = require("mongoose");
const Schema = mongoose.Schema;

mongoose.connect(
  `mongodb+srv://${process.env.MONGODB}&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
 
const UserSchema = new Schema({
  streamer: {
    type: String,
    required: true,
    unique: true,
  },
  refreshToken: {
    type: String,
    default: null,
  },
  accessToken: {
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
});

mongoose.model("user", UserSchema);
