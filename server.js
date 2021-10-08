const autoload = require("fastify-autoload");
const {
  addSpotify,
  refreshAccessToken,
  changeVolumeOnTime,
  currentlyPlaying,
  setTimeoutVolume
} = require("./spotify");
const { getUser, updateUser } = require("./controllers/UserController.js");
const { addNewUser, refreshTwitchTokens } = require("./twitch/twitch.js");
const path = require("path");
const { twitchCommands } = require("./twitch/index.js");
twitchCommands();

setTimeoutVolume();
setTimeout(refreshAccessToken, 1000);
setInterval(refreshAccessToken, 1800 * 1000);
setTimeout(refreshTwitchTokens, 1000);
setInterval(refreshTwitchTokens, 10000 * 1000);

const { MongoClient } = require("mongodb");

const client = new MongoClient(
  `mongodb+srv://${process.env.MONGODB}&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

client.connect(err => {
  err
    ? console.log("Error with connect to database")
    : console.log("Database connected!");

  const collection = client.db("streamers").collection("users");
});

const fastify = require("fastify")({
  logger: true
});

fastify.register(require("point-of-view"), {
  engine: {
    handlebars: require("handlebars")
  }
});
fastify.register(require("fastify-cors"));

async function app(fastify, options) {
  fastify.register(autoload, {
    dir: path.join(__dirname, "routes")
  });
}

fastify.listen(process.env.PORT, function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening on ${address}`);
});
