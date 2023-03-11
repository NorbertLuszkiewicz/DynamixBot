const axios = require("axios");
let token;

const setTwitchHelixToken = async () => {
  const { data } = await axios.post("https://id.twitch.tv/oauth2/token", {
    client_id: process.env.BOT_CLIENT_ID,
    client_secret: process.env.BOT_CLIENT_SECRET,
    grant_type: "client_credentials",
  });

  token = data.access_token;
  console.log(token)
  setTimeout(setTwitchHelixToken, data.expires_in - 4000);
};

const timeout = async (userId, duration, reason, streamerId) => {
  const { data } = await axios.post(`https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${}&moderator_id=${process.env.BOT_CLIENT_ID}`, {
    'user_id': userId,
     duration,
     reason,
  });

  token = data.access_token;
  console.log(token)
  setTimeout(setTwitchHelixToken, data.expires_in - 4000);
};

module.exports = {
  setTwitchHelixToken,
};
