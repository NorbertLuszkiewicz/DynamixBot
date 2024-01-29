const path = require("path");
const express = require("express");
const { MongoClient } = require("mongodb");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// const { refreshAccessToken, setTimeoutVolume } = require("./spotify");
// const { setTimeoutVolume: setTimeoutVolumeStreamElements } = require("./streamElements");
// const { refreshTwitchTokens } = require("./twitch/twitch.js");
// const { sendMessage } = require("./twitch/helix.js");
// const { twitchCommands } = require("./twitch/index.js");
// const { checkActiveRiotAccount } = require("./riot/riot.js");
// const { runner } = require("./tiktokDiscordBot");
const router = require("./routes");
require("dotenv").config();

const app = express();

//Initial functions;
onInit();

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
    // refreshAccessToken();
    // refreshTwitchTokens();
    // checkActiveRiotAccount();

    app.listen(process.env.PORT || 80);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

function onInit() {
  // twitchCommands();
  // setTimeoutVolume();
  // setTimeoutVolumeStreamElements();
  // setInterval(refreshAccessToken, 1800 * 1000);
  // setInterval(checkActiveRiotAccount, 180 * 1000);
  // setInterval(refreshTwitchTokens, 10000 * 1000);
}

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/", router);

app.use((req, res, next) => {});
