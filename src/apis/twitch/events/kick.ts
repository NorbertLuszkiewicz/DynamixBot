import axios from "axios";
import { addCommand } from "../../../controllers/CommandController";
import {
  addCredentials,
  getCredentials,
  updateCredentials,
  getAllCredentials,
  getCredentialsByKickID,
} from "../../../controllers/CredentialsController";
import { addSong } from "../../../controllers/SongController";
import { KickMessageData } from "../../../types/types";
import { handleChatMessage } from "./messages";
import { handleChatCommand } from "./commands";

const TOKEN = "https://id.kick.com/oauth/token";

export const addKickAccess = async (
  code,
  streamerNick = null
): Promise<{ status: string; name?: string; token?: string; kickName?: string }> => {
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  // params.append("redirect_uri", `https://pain-band-lost-instances.trycloudflare.com/kickRedirect`);
  params.append("redirect_uri", `${process.env.BE_URL}kickRedirect`);
  params.append("client_id", process.env.KICK_CLIENT_ID);
  params.append("client_secret", process.env.KICK_SECRET);
  params.append("code_verifier", "code_verifier");

  try {
    const { data } = await axios.post(`${TOKEN}`, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const users = await getStreamerData(data.access_token);
    const userName: string = users?.data?.[0]?.name;
    const userID: string = users?.data?.[0]?.user_id;
    const userInDatabase = await getCredentials(streamerNick || userName);

    if (userInDatabase.length === 0) {
      await addCredentials({
        streamer: userName,
        kickID: userID,
        kickNick: userName,
        kickAccessToken: data.access_token,
        kickRefreshToken: data.refresh_token,
      });
      await addSong({ streamer: userName });
      await addCommand({ streamer: userName });
    } else {
      await updateCredentials({
        streamer: streamerNick || userName,
        kickNick: userName,
        kickID: userID,
        kickAccessToken: data.access_token,
        kickRefreshToken: data.refresh_token,
      });

      await subscribeKickWebhook(data.access_token, users.data[0].id);
    }

    return {
      status: "success",
      name: userName,
      kickName: userName,
      token: data.access_token,
    };
  } catch (err) {
    if (err.response) console.error("Kick token response data:", JSON.stringify(err.response.data, null, 2));

    console.log(`Error while getting first kick token (${err})`);
    return { status: "error" };
  }
};

export const refreshKickTokens = async (): Promise<void> => {
  try {
    const streamers = await getAllCredentials();

    streamers.forEach(async streamer => {
      try {
        if (streamer.kickAccessToken) {
          const params = new URLSearchParams();
          params.append("grant_type", "refresh_token");
          params.append("refresh_token", streamer.kickRefreshToken);
          params.append("client_id", process.env.KICK_CLIENT_ID);
          params.append("client_secret", process.env.KICK_SECRET);

          const { data } = await axios.post(`${TOKEN}`, params, {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          });

          await updateCredentials({
            streamer: streamer.streamer,
            kickAccessToken: data.access_token,
            kickRefreshToken: data.refresh_token,
          });
        }
      } catch (err) {
        console.log("RefreshToken Kick error", streamer.streamer, err.response.data || err?.message);
      }
    });

    console.log("reset kick token");
  } catch (err) {
    console.log(`Error while refreshing kick tokens ${err.data}`);
  }
};

export const getStreamerData = async (accessToken: string): Promise<any> => {
  try {
    const { data } = await axios.get("https://api.kick.com/public/v1/users", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": process.env.BOT_CLIENT_ID,
      },
    });

    return data;
  } catch (err) {
    console.log(`Error while getting streamer kick data ${err}`);
  }
};

export const getSubscribeKickWebhook = async (accessToken: string): Promise<any> => {
  try {
    const response = await axios.get("https://api.kick.com/public/v1/events/subscriptions", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": process.env.BOT_CLIENT_ID,
      },
    });

    return response.data;
  } catch (err) {
    console.log(`Error while get subscribing to kick webhook ${err}`);
  }
};

export const subscribeKickWebhook = async (accessToken: string, broadcasterUserId: string): Promise<any> => {
  const events = [
    {
      name: "chat.message.sent",
      version: 1,
    },
    {
      name: "channel.followed",
      version: 1,
    },
    {
      name: "channel.subscription.renewal",
      version: 1,
    },
    {
      name: "channel.subscription.gifts",
      version: 1,
    },
    {
      name: "channel.subscription.new",
      version: 1,
    },
    {
      name: "livestream.status.updated",
      version: 1,
    },
    {
      name: "moderation.banned",
      version: 1,
    },
  ];

  try {
    const response = await axios.post(
      "https://api.kick.com/public/v1/events/subscriptions",
      {
        method: "webhook",
        broadcaster_user_id: Number(broadcasterUserId),
        events,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err) {
    console.log(`Error while subscribing to kick webhook ${err}`, err.response?.data || err?.message);
  }
};

export const kickMessageEvent = async (data: KickMessageData): Promise<void> => {
  try {
    const credentials = await getCredentialsByKickID(data.sender.user_id);
    const user = data.sender.username;
    const message = data.content;
    const flags = {
      customReward: false,
      isBroadcaster: data.sender.identity.badges.find(x => x.type === "broadcaster") !== undefined,
      isModerator: data.sender.identity.badges.find(x => x.type === "moderator") !== undefined,
      isSubscriber: data.sender.identity.badges.find(x => x.type === "subscriber") !== undefined,
      isVip: data.sender.identity.badges.find(x => x.type === "vip") !== undefined,
    };
    const extra = {
      channel: credentials[0]?.streamer,
      userId: data.sender.user_id.toString(),
      // customRewardId: "",
    };

    if (message.startsWith("!")) {
      const [command, ...rest] = message.split(" ");

      await handleChatCommand({
        user,
        command,
        message: rest.join(" "),
        flags,
        extra,
        isKick: true,
        kickAccessToken: credentials[0]?.kickAccessToken,
      });
    } else {
      await handleChatMessage({
        user,
        message,
        flags,
        extra,
        isKick: true,
        kickAccessToken: credentials[0]?.kickAccessToken,
      });
    }
  } catch (err) {
    console.error("Error processing kick message event:", err);
  }
};
