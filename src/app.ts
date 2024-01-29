import express from "express";
import { MongoClient } from "mongodb";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";

import { refreshAccessToken, setTimeoutVolume } from "./apis/spotify";
import { setTimeoutVolume as setTimeoutVolumeStreamElements } from "./apis/streamElements";
import { refreshTwitchTokens } from "./apis/twitch/events/twitch";
import { sendMessage } from "./apis/twitch/events/helix";
import { twitchCommands } from "./apis/twitch";
import { checkActiveRiotAccount } from "./apis/riot";

import router from "./routes";

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
    refreshAccessToken();
    refreshTwitchTokens();
    checkActiveRiotAccount();

    app.listen(process.env.PORT || 80);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

function onInit() {
  console.log("INIT");
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
