const axios = require("axios");
const { addUser } = require("../controllers/UserController.js");

const TOKEN = "https://id.twitch.tv/oauth2/token";

const addNewUser = async code => {
  let accessToken;
  let refreshToken;
  const body = `grant_type=authorization_code&code=${code}&redirect_uri=https://dynamix-bot.glitch.me/register&client_id=${process.env.BOT_CLIENT_ID}&client_secret=${process.env.BOT_CLIENT_SECRET}`;

  try {
    const { data } = await axios.post(`${TOKEN}`, body, {});
    const users = await getStreamerData(data.access_token);

    data.access_token && (accessToken = data.access_token);
    data.refresh_token && (refreshToken = data.refresh_token);

    await addUser({
      streamer: users.data[0].login,
      spotifyAccessToken: data.access_token,
      spotifyRefreshToken: data.refresh_token
    });
    
    return {status:"success", name: users[0].login, token: data.access_token};
  } catch (err) {
    console.log(`Error while getting first token (${err})`);
    return "error";
  }
};

const getStreamerData = async accessToken => {
  try {
    const { data } = await axios.get("https://api.twitch.tv/helix/users", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": "bhwlcwuvtg51226poslegrqdcm8naz"
      }
    });)
    return {data};
  } catch (err) {
    console.log(`Error while getting streamer data ${err}`);
  }
};

module.exports = {
  addNewUser
};
