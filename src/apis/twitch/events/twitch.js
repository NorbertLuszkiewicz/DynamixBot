const axios = require("axios");
const { addUser, getUser, updateUser, getAllUser } = require("../../controllers/UserController.js.js");
require("../demonsbotfizowaty/index.js.js");

const TOKEN = "https://id.twitch.tv/oauth2/token";

const addNewUser = async code => {
  let accessToken;
  let refreshToken;
  const body = `grant_type=authorization_code&code=${code}&redirect_uri=https://dynamix-bot.glitch.me/register&client_id=${process.env.BOT_CLIENT_ID}&client_secret=${process.env.BOT_CLIENT_SECRET}`;

  try {
    const { data } = await axios.post(`${TOKEN}`, body, {});
    const users = await getStreamerData(data.access_token);
    const userName = users.data[0].login;

    data.access_token && (accessToken = data.access_token);
    data.refresh_token && (refreshToken = data.refresh_token);

    const userInDatabase = await getUser(userName);

    if (userInDatabase.length === 0) {
      await addUser({
        streamer: userName,
        twitchAccessToken: data.access_token,
        twitchRefreshToken: data.refresh_token,
      });
    } else {
      await updateUser({
        streamer: userName,
        twitchAccessToken: data.access_token,
        twitchRefreshToken: data.refresh_token,
      });
    }

    return {
      status: "success",
      name: userName,
      token: data.access_token,
    };
  } catch (err) {
    console.log(`Error while getting first token (${err})`);
    return "error";
  }
};

const refreshTwitchTokens = async () => {
  try {
    const streamers = await getAllUser();

    streamers.forEach(async streamer => {
      try {
        if (streamer.twitchAccessToken) {
          const [refreshToken] = await getUser(streamer.streamer);

          const body = `grant_type=refresh_token&refresh_token=${encodeURIComponent(
            refreshToken.twitchRefreshToken
          )}&client_id=${process.env.BOT_CLIENT_ID}&client_secret=${process.env.BOT_CLIENT_SECRET}`;

          const { data } = await axios.post(`${TOKEN}`, body, {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          });

          await updateUser({
            streamer: streamer.streamer,
            twitchAccessToken: data.access_token,
            twitchRefreshToken: data.refresh_token,
          });
        }
      } catch (err) {
        console.log("RefreshToken Twitch error", streamer.streamer);
      }
    });

    console.log("reset twitch token");
  } catch (err) {
    console.log(`Error while refreshing twitch tokens ${err.data}`);
  }
};

const getStreamerData = async accessToken => {
  try {
    const { data } = await axios.get("https://api.twitch.tv/helix/users", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": process.env.BOT_CLIENT_ID,
      },
    });

    return data;
  } catch (err) {
    console.log(`Error while getting streamer data ${err}`);
  }
};

const getWeather = async city => {
  try {
    const { data } = await axios.get(
      `http://api.openweathermap.org/data/2.5/weather?q=${city}&lang=pl&appid=${process.env.WEATHER_TOKEN}`
    );

    return {
      temp: data.main.temp,
      speed: data.wind.speed,
      description: data.weather[0].description,
    };
  } catch (err) {
    console.log(`Error while getting weather ${err}`);
  }
};

const getHoroscope = async sign => {
  try {
    const { data } = await axios.post(`https://aztro.sameerkumar.website/?sign=${sign}&day=today`);

    return data.description;
  } catch (err) {
    console.log(`Error while getting horoscope ${err}`);
  }
};

const changeBadWords = message => {
  const correctMessage = message
    .toLowerCase()
    .replace(/nigger/g, "ni**er")
    .replace(/niga/g, "n**a")
    .replace(/nigga/g, "n***a")
    .replace(/czarnuch/g, "cz***uch")
    .replace(/cwel/g, "c++l")
    .replace("nigger", "ni**er")
    .replace("niga", "n**a")
    .replace("nigga", "n***a")
    .replace("czarnuch", "cz***uch")
    .replace("cwel", "c++l");

  return correctMessage == message.toLowerCase() ? message : correctMessage;
};

module.exports = {
  addNewUser,
  refreshTwitchTokens,
  getWeather,
  getHoroscope,
  changeBadWords,
};
