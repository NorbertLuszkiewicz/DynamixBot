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
  }
  
  return {
    headers: {
      Authorization: `Bearer y5ea3fu7hbxmv9wi5z0rz5sj7fbi1a`,
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

const getUserId = async (name, streamer) => {

  try {
    const { data } = await axios.get(`${URL}users?login=${name}`,await getHeader(streamer));

    return data?.data[0]?.id
  } catch (err) {
    console.log("Error getUserId", err.response?.data)
  }
};

const timeout = async (userName, duration, reason, streamer) => {
  const body = { data :{
    user_id: await getUserId(userName, streamer),
    duration,
    reason,
  }};
  
  console.log(`${URL}moderation/bans?broadcaster_id=${await getUserId(streamer, streamer)}&moderator_id=171103106`, body,  await getHeader(streamer))

  try {
    const { data } = await axios.post(
      `${URL}moderation/bans?broadcaster_id=${await getUserId(streamer, streamer)}&moderator_id=171103106`,
      body,
      await getHeader(streamer)
    );
  } catch (err) {
    console.log("Error timeout function in twitch/helix", err.response?.data);
  }
};

const getPredition = async (streamer) => {
  try {
    const brodecasterId = await getUserId(streamer)
    const { data } = await axios.get(
      `${URL}predictions?broadcaster_id=${brodecasterId}`,
      await getHeader(streamer)
    );
    console.log(data, 'getPrediction')
    return data[0]
  } catch (err) {
    console.log("Error getPrediction", err.response?.data);
  }
};

const resolvePrediction = async (option, streamer) => {
  try {
    const prediction = await getPredition(streamer)
    const winningPrediction = prediction.outcomes.filter(outcome => outcome.title.toLowerCase().trim() === option.toLowerCase().trim())
    
    const body = {
    broadcaster_id: prediction.broadcaster_id,
    id: prediction.id,
    status: "RESOLVED",
    winning_outcome_id: winningPrediction[0].id
}

    const { data } = await axios.path(
      `${URL}predictions`,
      body,
      await getHeader(streamer)
    );
    
    console.log(data, 'getPrediction')
  } catch (err) {
    console.log("Error getPrediction", err.response?.data);
  }
};

module.exports = {
  setTwitchHelixToken,
  timeout,
  getUserId,
  resolvePrediction,
};
