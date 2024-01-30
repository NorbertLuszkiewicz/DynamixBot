import express from "express";
import { MongoClient } from "mongodb";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";

import { refreshAccessToken, setTimeoutVolume } from "./apis/spotify";
import { setTimeoutVolume as setTimeoutVolumeStreamElements } from "./apis/streamElements";
import { refreshTwitchTokens } from "./apis/twitch/events/twitch";
import { twitchCommands } from "./apis/twitch";
import { checkActiveRiotAccount } from "./apis/riot/lol";

import router from "./routes";

const app = express();

//Initial functions;
onInit();

const client = new MongoClient(`mongodb+srv://${process.env.MONGODB}&w=majority`);

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    refreshAccessToken();
    refreshTwitchTokens();
    checkActiveRiotAccount();

    app.listen(process.env.PORT || 80);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

function onInit() {
  console.log("INIT");
  twitchCommands();
  setTimeoutVolume();
  setTimeoutVolumeStreamElements();
  setInterval(refreshAccessToken, 1800 * 1000);
  setInterval(checkActiveRiotAccount, 180 * 1000);
  setInterval(refreshTwitchTokens, 10000 * 1000);
}

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/", router);
