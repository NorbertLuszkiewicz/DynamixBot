const path = require("path");
const { MongoClient } = require("mongodb");
const fastify = require("fastify")({
  logger: true,
});
const { refreshAccessToken, setTimeoutVolume } = require("./spotify");
const { setTimeoutVolume: setTimeoutVolumeStreamElements } = require("./streamElements");
const { refreshTwitchTokens } = require("./twitch/twitch.js");
const { twitchCommands } = require("./twitch/index.js");
const { checkActiveRiotAccount } = require("./riot/riot.js");
const { runner } = require("./tiktokDiscordBot");

require("dotenv").config();
//Initial functions;
// runner(); off tiktokbot
twitchCommands();
setTimeoutVolume();
setTimeoutVolumeStreamElements();

setInterval(refreshAccessToken, 1800 * 1000);
setInterval(checkActiveRiotAccount, 180 * 1000);
setInterval(refreshTwitchTokens, 10000 * 1000);

const client = new MongoClient(`mongodb+srv://${process.env.MONGODB}&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    refreshAccessToken();
    refreshTwitchTokens();
    checkActiveRiotAccount();

    fastify.listen(process.env.PORT, function (err, address) {
      if (err) {
        fastify.log.error(err);
        process.exit(1);
      }
      fastify.log.info(`Server listening on ${address}`);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

fastify.register(require("@fastify/cors"));
fastify.register(require("./routes"));
