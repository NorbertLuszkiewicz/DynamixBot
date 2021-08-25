const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const clientIdList = [{name:"dynam1x1", id: process.env.CLIENT_ID},{name:"og1ii", id: process.env.CLIENT_ID}]
const clientSecretList = [{name:"dynam1x1", id: process.env.CLIENT_SECRET},{name:"og1ii", id: process.env.CLIENT_SECRET}]
const accessToken = "";
const redirectUri = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
const PLAY = "https://api.spotify.com/v1/me/player/play";
const PAUSE = "https://api.spotify.com/v1/me/player/pause";
const NEXT = "https://api.spotify.com/v1/me/player/next";
const CURRENTLYPLAYING =
  "https://api.spotify.com/v1/me/player/currently-playing";
let positionMs = 0;

let url = `${AUTHORIZE}?client_id=${clientId}&response_type=code&redirect_uri=${encodeURI(
  redirectUri
)}&show_dialog=true&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private`;

let refreshToken

const runApi = () => {};
const startSong = () => {};
const pauseSong = () => {};

function fetchAccessToken(code) {
  let body = "grant_type=authorization_code";
  body += "&code=" + code;
  body += "&redirect_uri=" + encodeURI(redirectUri);
  body += "&client_id=" + clientId;
  body += "&client_secret=" + clientSecret;
  callAuthorizationApi(body);
}

function refreshAccessToken() {
  refreshToken = localStorage.getItem("refresh_token");
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
    "Basic " + btoa(clientId + ":" + clientSecret)
  );
  xhr.send(body);
  xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse() {
  if (this.status == 200) {
    let data = JSON.parse(this.responseText);
    console.log(data);
    if (data.access_token != undefined) {
      accessToken = data.access_token;
      localStorage.setItem("access_token", accessToken);
    }
    if (data.refresh_token != undefined) {
      refreshToken = data.refresh_token;
      localStorage.setItem("refresh_token", refreshToken);
    }
  } else {
    console.log(this.responseText);
  }
}

module.exports = { pauseSong, startSong, runApi };
