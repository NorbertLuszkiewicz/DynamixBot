import axios from "axios";
import { addCommand } from "../../../controllers/CommandController";
import {
  addCredentials,
  getCredentials,
  updateCredentials,
  getAllCredentials,
} from "../../../controllers/CredentialsController";
import { addRiot } from "../../../controllers/RiotController";
import { addSong } from "../../../controllers/SongController";

const TOKEN = "https://id.kick.com/oauth/token";

export const addKickAccess = async (
  code,
  streamerNick = null
): Promise<{ status: string; name?: string; token?: string; kickName?: string }> => {
  const body = `grant_type=authorization_code&code=${code}&redirect_uri=${process.env.BE_URL}kickRedirect?nick=${streamerNick}&client_id=${process.env.KICK_CLIENT_ID}&client_secret=${process.env.KICK_SECRET}&code_verifier=code_verifier`;

  try {
    const { data } = await axios.post(`${TOKEN}`, body, {});
    const users = await getStreamerData(data.access_token);
    const userName: string = users?.data?.[0]?.name;
    const userInDatabase = await getCredentials(streamerNick || userName);

    if (userInDatabase.length === 0) {
      await addCredentials({
        streamer: userName,
        kickAccessToken: data.access_token,
        kickRefreshToken: data.refresh_token,
      });
      await addRiot({ streamer: userName });
      await addSong({ streamer: userName });
      await addCommand({ streamer: userName });
    } else {
      await updateCredentials({
        streamer: streamerNick || userName,
        kickNick: userName,
        kickAccessToken: data.access_token,
        kickRefreshToken: data.refresh_token,
      });
    }

    return {
      status: "success",
      name: userName,
      kickName: userName,
      token: data.access_token,
    };
  } catch (err) {
    console.log(`Error while getting first kick token (${err})`);
    return { status: "error" };
  }
};

export const refreshKickTokens = async (): Promise<void> => {
  try {
    const streamers = await getAllCredentials();

    streamers.forEach(async streamer => {
      try {
        if (streamer.kickAccessToken) {
          const params = new URLSearchParams();
          params.append("grant_type", "refresh_token");
          params.append("refresh_token", streamer.kickRefreshToken);
          params.append("client_id", process.env.KICK_CLIENT_ID);
          params.append("client_secret", process.env.KICK_SECRET);

          const { data } = await axios.post(`${TOKEN}`, params, {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          });

          await updateCredentials({
            streamer: streamer.streamer,
            kickAccessToken: data.access_token,
            kickRefreshToken: data.refresh_token,
          });
        }
      } catch (err) {
        console.log("RefreshToken Kick error", streamer.streamer, err.response.data || err?.message);
      }
    });

    console.log("reset kick token");
  } catch (err) {
    console.log(`Error while refreshing kick tokens ${err.data}`);
  }
};

export const getStreamerData = async (accessToken: string): Promise<any> => {
  try {
    const { data } = await axios.get("https://api.kick.com/public/v1/users", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": process.env.BOT_CLIENT_ID,
      },
    });

    return data;
  } catch (err) {
    console.log(`Error while getting streamer kick data ${err}`);
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
