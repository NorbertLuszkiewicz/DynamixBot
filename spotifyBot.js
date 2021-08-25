var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const clientIdList = [{name:"dynam1x1", id: process.env.CLIENT_ID},{name:"og1ii", id: process.env.CLIENT_ID}]
const clientSecretList = [{name:"dynam1x1", id: process.env.CLIENT_SECRET},{name:"og1ii", id: process.env.CLIENT_SECRET}]
let accessToken = "BQAJ4xsBe8xP9tRyUkDlDC5zmgxK6y2HvUqW_fjXQ3e7RphcC-DIvex6DlA09PamCBmiArNikMiIBcu8jhQifHTJ5zEOlTXpn32L_s0gOZhT_WV-YIwZebkxtn25xV8bl88oo-wMq5GkBRzjqAVfCLtTTKgZqTaILDuMiHThXoUJUMnreFnWetIaFuPh9LeBV5pXo3mQlFc_QyO3wGwNa725Rg";
const redirectUri = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
const PLAY = "https://api.spotify.com/v1/me/player/play";
const PAUSE = "https://api.spotify.com/v1/me/player/pause";
const NEXT = "https://api.spotify.com/v1/me/player/next";
const PLAYER = "https://api.spotify.com/v1/me/player";
const CURRENTLYPLAYING =
  "https://api.spotify.com/v1/me/player/currently-playing";
let positionMs = 0;
let device = {og1ii: "",kezman22: "c3e9e9038e921489b7106d098ca11128b330ae36", simplywojtek: ""};

let url = `${AUTHORIZE}?client_id=${clientId}&response_type=code&redirect_uri=${encodeURI(
  redirectUri
)}&show_dialog=true&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private`;

let refreshToken = "AQCg9rcXt-DPSVtz9rEqE3fA1x78NqvV6nysu5T9O1EZ1wFWmMJw3yO2budF5OknAiKM5geXUKPXk0Z2RnHm9DMD294V_WdcHJ9Wq4Meg3oRA7YYopjM0sSfpMC1qjQu-w8"

let code = {og1ii: "",kezman22: "AQCsHkGOlwiOVXAhKyZcmtcaFgIcRUgL5iGALcRI6foJV4uIHNK_uIdgIMWfKFcrF5dYedaCldmFq8v7I2hpLksID9P_XOgwRHkwnz_ciJ1MXhCOAabYJMOcAurI6Cskxr97sH9k4p6SObCHiom6--5D69VvZv_egq_03tvbpM6UZETOAy1JwTzEcdyx5II032TPY1XywOEoVGTcPY-kOiMofbifXKPoAVRTl7HBZxrSk_kZFJaoEN9I6zfh8e9cDL9vdYCIJkHCKVZG0AQWCEOsH3hnPgKGEq8f6iLfEY-FBLwsX_V9etrNqc9TWGlJION0OBXp5BFzUYLyazKJFUwxkLKB_W39pDiQvruEX4Tyk8Re2avk_NRjRrCQiHf9vQXmbMqQRHKN8WZwF3ZWCxUazcixlZ80rqlGBanpZVVoBffLxxzwYbObsA", simplywojtek: ""}
let currentPlaylist = {og1ii: "",kezman22: "", simplywojtek: ""}

const runApi = () => {};

const startSong = async (streamer) => {
  await refreshAccessToken()
  
  let body = {};
  body.position_ms = positionMs;

  callApi(
    "PUT",
    PLAY + "?device_id=" + device[streamer],
    JSON.stringify(body),
    refreshAccessToken
  );
};


const pauseSong = async (streamer) => {
  await refreshAccessToken()
  
  callApi("PUT", PAUSE + "?device_id=" + device[streamer], null, handleApiResponse)
  
  console.log("pausesong")
};

function fetchAccessToken() {
  let body = "grant_type=authorization_code";
  body += "&code=" + code;
  body += "&redirect_uri=" + encodeURI(redirectUri);
  body += "&client_id=" + clientId;
  body += "&client_secret=" + clientSecret;
  callAuthorizationApi(body);
}

function refreshAccessToken() {
console.log("refresh ti")
  let body = "grant_type=refresh_token";
  body += "&refresh_token=" + refreshToken;
  body += "&client_id=" + clientId;
  callAuthorizationApi(body);
}

function callAuthorizationApi(body) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", TOKEN, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader(
    "Authorization",
    "Basic " + Buffer.from(clientId + ":" + clientSecret).toString('base64')
  );
  xhr.send(body);
  xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse() {
  if (this.status == 200) {
    let data = JSON.parse(this.responseText);

    if (data.access_token != undefined) {
      accessToken = data.access_token;
    }
    if (data.refresh_token != undefined) {
      refreshToken = data.refresh_token;
    }
  } else {
    console.log(this.responseText);
  }
}

function callApi(method, url, body, callback) {
  let xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
  xhr.send(body);
  xhr.onload = callback;
}

function handleApiResponse() {
  console.log("stop albo start")
  if (this.status == 200) {
    console.log(this.responseText, "response");

    setTimeout(currentlyPlaying, 1000);
  } else if (this.status == 204) {
    setTimeout(currentlyPlaying, 1000);
  } else if (this.status == 401) {
    refreshAccessToken();
  } else {
    console.log(this.responseText);
  }
}

function handleCurrentlyPlayingResponse(streamer) {
  if (this.status == 200) {
    const data = JSON.parse(this.responseText);
    
    if (data.device) {
      device[streamer] = data.device.id;
    }
    positionMs = data.progress_ms;


    if (data.context != null) {
      // select playlist
      currentPlaylist[streamer] = data.context.uri;
      currentPlaylist[streamer] = currentPlaylist[streamer].substring(
        currentPlaylist[streamer].lastIndexOf(":") + 1,
        currentPlaylist[streamer].length
      );

    }


  } else if (this.status == 204) {
  } else if (this.status == 401) {
    refreshAccessToken();
  } else {
    console.log(this.responseText, "error");
    alert(this.responseText);
  }
}

function currentlyPlaying() {
  callApi("GET", PLAYER + "?market=US", null, handleCurrentlyPlayingResponse);
}


module.exports = { pauseSong, startSong, runApi, refreshAccessToken };
