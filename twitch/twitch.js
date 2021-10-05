

const axios = require("axios");

const AUTH = 

const addSpotify = async (code) => {
  let accessToken;
  let refreshToken;
  const body = `grant_type=authorization_code&code=${code}&redirect_uri=https://dynamix-bot.glitch.me/callback`;

  try {
    const { data } = axios.post(`${TOKEN}`, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          clientId + ":" + clientSecret
        ).toString("base64")}`
      }
    });
    data.access_token && (accessToken = data.access_token);
    data.refresh_token && (refreshToken = data.refresh_token);
    console.log("accessToken", data.access_token);
    console.log("refreshToken", data.refresh_token);
    
    return "success"
    
  } catch ({ response }) {
    console.log(
      `Error while getting first token (${response.status} ${response.statusText})`
    );
    return"error";
  }
};

module.exports = {
  addSpotify
};
