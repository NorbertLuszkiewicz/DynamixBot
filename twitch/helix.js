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

module.exports = {
  setTwitchHelixToken,
};
