const axios = require("axios");

const TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const URL = "https://api.twitch.tv/helix/";
let token;
const getHeader = () => {
  return {
    headers: {
      Authorization: `Bearer twkm0oi8vkmpxhnur1xwhura9sp20p`,
      "Client-Id": process.env.BOT_CLIENT_ID,
      "Content-Type": "application/json",
    },
  };
};

const setTwitchHelixToken = async () => {
  try {
    const { data } = await axios.post(TOKEN_URL, {
      client_id: process.env.BOT_CLIENT_ID,
      client_secret: process.env.BOT_CLIENT_SECRET,
      grant_type: "client_credentials",
    });

    token = data.access_token;

    setTimeout(setTwitchHelixToken, data.expires_in - 4000);
  } catch (err) {
    console.log("Error setTwitchHelixToken", err.response?.data);
  }
};

const getUserId = async (name) => {
  try {
    const { data } = await axios.get(`${URL}users?login=${name}`, getHeader());

    return data?.data[0]?.id
  } catch (err) {
    console.log("Error getUserId", err.response?.data);
  }
};

const timeout = async (userName, duration, reason, streamerId) => {
  const body = { data :{
    user_id: await getUserId(userName),
    duration,
    reason,
  }};

  try {
    const { data } = await axios.post(
      `${URL}moderation/bans?broadcaster_id=${await getUserId(streamerId)}&moderator_id=171103106`,
      body,
      getHeader()
    );

    console.log(data);
  } catch (err) {
    console.log("Error timeout function in twitch/helix", err.response?.data);
  }
};

module.exports = {
  setTwitchHelixToken,
  timeout,
  getUserId,
};
