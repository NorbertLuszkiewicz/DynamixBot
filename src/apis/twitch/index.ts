import ComfyJS from "comfy.js";
import { messages, setTimeoutVolume } from "./events/messages";
import { events } from "./events/events";
import { commands } from "./events/commands";
import { getAllCredentials } from "../../controllers/CredentialsController";

export const twitchCommands = async (): Promise<void> => {
  try {
    messages();
    events();
    commands();
    setTimeoutVolume();

    const allStreamers = await getAllCredentials();
    const TWITCHCHANNELS = allStreamers.map(streamer => streamer.streamer);
    const TWITCHUSER = "dynam1x1";
    const OAUTH = allStreamers.find(s => s.streamer === TWITCHUSER)?.twitchAccessToken || process.env.OAUTH;

    ComfyJS.Init(TWITCHUSER, `oauth:${OAUTH}`, TWITCHCHANNELS);
  } catch (err) {
    console.log(`Error while connecting to twitch ${err}`);
  }
};
