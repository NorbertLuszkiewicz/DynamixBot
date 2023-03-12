const axios = require("axios");
const {
  getUser,
} = require("../controllers/UserController.js");

const TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const URL = "https://api.twitch.tv/helix/";
let TOKEN;
const getHeader = async (streamer) => {
  let token = TOKEN
  if(streamer){
    const [data] = await getUser(streamer);
    token = data.twitchAccessToken
    console.log(data.twitchAccessToken)
  }
  
  return {
    headers: {
      Authorization: `Bearer ${token}`,
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

    TOKEN = data.access_token;

    setTimeout(setTwitchHelixToken, data.expires_in - 4000);
  } catch (err) {
    console.log("Error setTwitchHelixToken", err.response?.data);
  }
};

const getUserId = async (name) => {
  console.log(await getHeader())
  try {
    const { data } = await axios.get(`${URL}users?login=${name}`,await getHeader());

    return data?.data[0]?.id
  } catch (err) {
    console.log("Error getUserId", err.response?.data);
  }
};

const timeout = async (userName, duration, reason, streamer) => {
  const body = { data :{
    user_id: await getUserId(userName),
    duration,
    reason,
  }};

  try {
    const { data } = await axios.post(
      `${URL}moderation/bans?broadcaster_id=${await getUserId(streamer)}&moderator_id=171103106`,
      body,
      await getHeader(streamer)
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
