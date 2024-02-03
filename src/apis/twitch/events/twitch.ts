import axios from "axios";
import { addUser, getUser, updateUser, getAllUser } from "../../../controllers/UserController";

const TOKEN = "https://id.twitch.tv/oauth2/token";

export const addNewUser = async (code): Promise<{ status: string; name?: string; token?: string }> => {
  const body = `grant_type=authorization_code&code=${code}&redirect_uri=https://dynamix-bot.glitch.me/register&client_id=${process.env.BOT_CLIENT_ID}&client_secret=${process.env.BOT_CLIENT_SECRET}`;

  try {
    const { data } = await axios.post(`${TOKEN}`, body, {});
    const users = await getStreamerData(data.access_token);
    const userName = users?.data?.[0]?.login;
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
    return { status: "error" };
  }
};

export const refreshTwitchTokens = async (): Promise<void> => {
  try {
    const streamers = await getAllUser();

    streamers.forEach(async streamer => {
      try {
        if (streamer.twitchAccessToken) {
          const body = `grant_type=refresh_token&refresh_token=${encodeURIComponent(
            streamer.twitchRefreshToken
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

export const getStreamerData = async (accessToken: string): Promise<any> => {
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

export const getWeather = async (city: string): Promise<{ temp: number; speed: string; description: string }> => {
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

export const getHoroscope = async (sign: string): Promise<string> => {
  try {
    const { data } = await axios.post(`https://aztro.sameerkumar.website/?sign=${sign}&day=today`);

    return data.description;
  } catch (err) {
    console.log(`Error while getting horoscope ${err}`);
  }
};
