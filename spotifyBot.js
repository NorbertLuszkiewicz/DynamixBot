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
const PLAYER = "https://api.spotify.com/v1/me/player";
const CURRENTLYPLAYING =
  "https://api.spotify.com/v1/me/player/currently-playing";
let positionMs = 0;

let url = `${AUTHORIZE}?client_id=${clientId}&response_type=code&redirect_uri=${encodeURI(
  redirectUri
)}&show_dialog=true&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private`;

let refreshToken

const runApi = () => {};
const startSong = () => {
   let playlist_id = document.getElementById("playlists").value;
  let trackindex = document.getElementById("tracks").value;
  let album = document.getElementById("album").value;
  let body = {};
  if (album.length > 0) {
    body.context_uri = album;
  } else {
    body.context_uri = "spotify:playlist:" + playlist_id;
  }
  body.offset = {};
  body.offset.position = trackindex.length > 0 ? Number(trackindex) : 0;
  body.offset.position_ms = positionMs;
  body.position_ms = positionMs;

  callApi(
    "PUT",
    PLAY + "?device_id=" + deviceId(),
    JSON.stringify(body),
    handleApiResponse
  );
};
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

function callApi(method, url, body, callback) {
  let xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
  xhr.send(body);
  xhr.onload = callback;
}

function handleApiResponse() {
  if (this.status == 200) {
    console.log(this.responseText, "response");
    if (this.responseText.timestamp) {
      this.position_ms = this.responseText.progress_ms;
    }
    setTimeout(currentlyPlaying, 500);
  } else if (this.status == 204) {
    setTimeout(currentlyPlaying, 500);
  } else if (this.status == 401) {
    refreshAccessToken();
  } else {
    console.log(this.responseText);
    alert(this.responseText);
  }
}

function handleCurrentlyPlayingResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    positionMs = data.progress_ms;

    if (data.item != null) {
      document.getElementById("albumImage").src = data.item.album.images[0].url;
      document.getElementById("trackTitle").innerHTML = data.item.name;
      document.getElementById("trackArtist").innerHTML =
        data.item.artists[0].name;
    }

  } else if (this.status == 204) {
  } else if (this.status == 401) {
    refreshAccessToken();
  } else {
    console.log(this.responseText);
    alert(this.responseText);
  }
}

function currentlyPlaying() {
  callApi("GET", PLAYER + "?market=US", null, handleCurrentlyPlayingResponse);
}


module.exports = { pauseSong, startSong, runApi };
