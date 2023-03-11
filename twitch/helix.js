const axios = require("axios");
let token;
const header = {
  headers: {
    Authorization: `Bearer ${token}`,
    "Client-Id": process.env.BOT_CLIENT_ID,
    "Content-Type": "application/json",
  },
};

const setTwitchHelixToken = async () => {
  const { data } = await axios.post("https://id.twitch.tv/oauth2/token", {
    client_id: process.env.BOT_CLIENT_ID,
    client_secret: process.env.BOT_CLIENT_SECRET,
    grant_type: "client_credentials",
  });

  token = data.access_token;

  setTimeout(setTwitchHelixToken, data.expires_in - 4000);
};

const timeout = async (userId, duration, reason, streamerId) => {
  const body = {
    user_id: userId,
    duration,
    reason,
  };

  const { data } = await axios.post(
    `https://api.twitch.tv/helix/moderation/bans?broadcaster_id=171103106&moderator_id=171103106`,
    body,
    header
  );

  console.log(token);

};

module.exports = {
  setTwitchHelixToken,
  timeout
};
