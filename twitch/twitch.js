const axios = require("axios");
const { addUser, getUser } = require("../controllers/UserController.js");

const TOKEN = "https://id.twitch.tv/oauth2/token";

const addNewUser = async code => {
  let accessToken;
  let refreshToken;
  const body = `grant_type=authorization_code&code=${code}&redirect_uri=https://dynamix-bot.glitch.me/register&client_id=${process.env.BOT_CLIENT_ID}&client_secret=${process.env.BOT_CLIENT_SECRET}`;

  try {
    const { data } = await axios.post(`${TOKEN}`, body, {});
    const users = await getStreamerData(data.access_token);
    const userName = users.data[0].login

    data.access_token && (accessToken = data.access_token);
    data.refresh_token && (refreshToken = data.refresh_token);

    const userInDatabase = await getUser(userName);

    userInDatabase.length === 0 &&
      (await addUser({
        streamer: userName,
        twitchAccessToken: data.access_token,
        twitchRefreshToken: data.refresh_token
      }));

    return {
      status: "success",
      name: userName,
      token: data.access_token
    };
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
    });

    return data;
  } catch (err) {
    console.log(`Error while getting streamer data ${err}`);
  }
};

module.exports = {
  addNewUser
};
