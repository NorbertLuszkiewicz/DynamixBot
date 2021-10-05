const axios = require("axios");
const { updateUser } = require("../controller/UserController.js";

const TOKEN = "https://id.twitch.tv/oauth2/token";

const addNewUser = async code => {
  let accessToken;
  let refreshToken;
  const body = `grant_type=authorization_code&code=${code}&redirect_uri=https://dynamix-bot.glitch.me/register&client_id=bhwlcwuvtg51226poslegrqdcm8naz&client_secret=j3up4evrkm7mbkgixcbafv7cjrrxw6`;

  try {
    const { data } = await axios.post(`${TOKEN}`, body, {});
    data.access_token && (accessToken = data.access_token);
    data.refresh_token && (refreshToken = data.refresh_token);
    console.log("accessToken", data.access_token);
    console.log("refreshToken", data.refresh_token);

    await updateUser({
      streamer: streamer.streamer,
      spotifyAccessToken: data.access_token,
      spotifyRefreshToken: data.refresh_token
    });

    console.log(data, "data");
  } catch (err) {
    console.log(`Error while getting first token (${err})`);
    return "error";
  }
};

module.exports = {
  addNewUser
};
