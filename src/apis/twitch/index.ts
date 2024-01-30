import ComfyJS from "comfy.js";
import axios from "axios";
import { messages, setTimeoutVolume } from "./events/messages";
import { events } from "./events/events";
import { commands } from "./events/commands";
import { getAllUser } from "../../controllers/UserController";

export const twitchCommands = async () => {
  try {
    messages();
    events();
    commands();
    setTimeoutVolume();

    const allStreamers = await getAllUser();
    const TWITCHCHANNELS = allStreamers.map(streamer => streamer.streamer);
    const TWITCHUSER = "dynam1x1";
    const OAUTH = process.env.OAUTH;

    ComfyJS.Init(TWITCHUSER, OAUTH, TWITCHCHANNELS);
  } catch (err) {
    console.log(`Error while connecting to twitch ${err}`);
  }
};