import ComfyJS from "comfy.js";
import { handleChatMessage, setTimeoutVolume } from "./events/messages";
import { events } from "./events/events";
import { handleChatCommand } from "./events/commands";
import { getAllCredentials } from "../../controllers/CredentialsController";
import { getSubscribeKickWebhook, subscribeKickWebhook } from "./events/kick";

export const twitchCommands = async (): Promise<void> => {
  try {
    ComfyJS.onChat = async (user, message, flags, self, extra) => {
      await handleChatMessage({
        user,
        message,
        flags,
        extra,
      });
    };

    ComfyJS.onCommand = async (user, command, message, flags, extra) => {
      await handleChatCommand({
        user,
        command,
        message,
        flags,
        extra,
      });
    };

    events();
    setTimeoutVolume();

    const allStreamers = await getAllCredentials();
    const TWITCHUSER = "dynam1x1";
    const TWITCHCHANNELS =
      process.env.IS_PROD === "true" ? allStreamers.map(streamer => streamer.streamer) : TWITCHUSER;
    const OAUTH = allStreamers.find(s => s.streamer === TWITCHUSER)?.twitchAccessToken || process.env.OAUTH;

    ComfyJS.Init(TWITCHUSER, `oauth:${OAUTH}`, TWITCHCHANNELS);
  } catch (err) {
    console.log(`Error while connecting to twitch ${err}`);
  }
};

export const kickCommands = async (): Promise<void> => {
  try {
    const allStreamers = await getAllCredentials();
    const KICKCHANNELS = allStreamers.filter(streamer => streamer.kickID);

    for (const streamer of KICKCHANNELS) {
      await subscribeKickWebhook(streamer.kickAccessToken, streamer.kickID);
    }
  } catch (err) {
    console.log(`Error while connecting to kick ${err}`);
  }
};
