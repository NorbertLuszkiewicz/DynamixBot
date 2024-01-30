import axios from "axios";
import ComfyJS from "comfy.js";

import { getUser } from "../../../controllers/UserController";

const TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const URL = "https://api.twitch.tv/helix/";

export const getHeader = async () => {
  const [data] = await getUser("dynam1x1");

  return {
    headers: {
      Authorization: `Bearer ${data.twitchAccessToken}`,
      "Client-Id": process.env.BOT_CLIENT_ID,
      "Content-Type": "application/json",
    },
  };
};

export const getUserId = async name => {
  try {
    const { data } = await axios.get(`${URL}users?login=${name}`, await getHeader());

    return data?.data[0]?.id;
  } catch (err) {
    console.log("Error getUserId", err.response?.data);
  }
};

export const timeout = async (userName, duration, reason, streamer) => {
  const body = {
    data: {
      user_id: await getUserId(userName),
      duration,
      reason,
    },
  };

  try {
    const { data } = await axios.post(
      `${URL}moderation/bans?broadcaster_id=${await getUserId(streamer)}&moderator_id=171103106`,
      body,
      await getHeader()
    );
  } catch (err) {
    console.log("Error timeout function in twitch/helix", err.response?.data);
  }
};

export const sendMessage = (message, streamer) => {
  ComfyJS.Say(message, streamer);
};

export const getPredition = async streamer => {
  try {
    const brodecasterId = await getUserId(streamer);
    const { data } = await axios.get(`${URL}predictions?broadcaster_id=${brodecasterId}`, await getHeader());
    console.log(data, "getPrediction");
    return data[0];
  } catch (err) {
    console.log("Error getPrediction", err.response?.data);
  }
};

export const resolvePrediction = async (option, streamer) => {
  try {
    const prediction = await getPredition(streamer);
    const winningPrediction = prediction.outcomes.filter(
      outcome => outcome.title.toLowerCase().trim() === option.toLowerCase().trim()
    );

    const body = {
      broadcaster_id: prediction.broadcaster_id,
      id: prediction.id,
      status: "RESOLVED",
      winning_outcome_id: winningPrediction[0].id,
    };

    const { data } = await axios.patch(`${URL}predictions`, body, await getHeader());

    console.log(data, "getPrediction");
  } catch (err) {
    console.log("Error getPrediction", err.response?.data);
  }
};