const path = require("path");
const { MongoClient } = require("mongodb");
const { refreshAccessToken, setTimeoutVolume } = require("./spotify");
const {
  setTimeoutVolume: setTimeoutVolumeStreamElements
} = require("./streamElements");
const { refreshTwitchTokens } = require("./twitch/twitch.js");
const { twitchCommands } = require("./twitch/index.js");


const { getUserTFT } = require("./riot/riot.js");

getUserTFT()


//Initial functions
twitchCommands();
setTimeoutVolume();
setTimeoutVolumeStreamElements();
setTimeout(refreshAccessToken, 1000);
setInterval(refreshAccessToken, 1800 * 1000);
setTimeout(refreshTwitchTokens, 1000);
setInterval(refreshTwitchTokens, 10000 * 1000);

const client = new MongoClient(
  `mongodb+srv://${process.env.MONGODB}&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

client.connect(err => {
  if (err) {
    console.log("Error with connect to database");
    refreshAccessToken;
  } else {
    console.log("Database connected!");
  }
});

const fastify = require("fastify")({
  logger: true
});
fastify.register(require("fastify-cors"));
fastify.register(require("./routes"));

fastify.listen(process.env.PORT, function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening on ${address}`);
});
