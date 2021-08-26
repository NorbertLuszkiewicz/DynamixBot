var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const clientIdList = [
  { name: "dynam1x1", id: process.env.CLIENT_ID },
  { name: "og1ii", id: process.env.CLIENT_ID }
];
const clientSecretList = [
  { name: "dynam1x1", id: process.env.CLIENT_SECRET },
  { name: "og1ii", id: process.env.CLIENT_SECRET }
];
let accessToken =
  "BQBujnjEobElD-6NrVgSYQrHbMzVKy8R8HnYOyZXwZMne-vmupE8wruoSWU58ytwsRtYEZKPpqNQ2ICdlTyC0IzGjJJsYusNyNCDDrmdFutUFn7mSjLIvkNpQyHfhsrx6aT0ysgc7_kDYPPx3A2LOjNsxQDksJG44W-hAb8MnHzkslxBZmmtXfBqZc2UYz1WYCY2txOgB4DVbgbiHphW9a7fAL3fnqRtC-ZrY20Ji_14GqNaEWSB4pmHel3FhD_XvdSY2PNKT3CFcXFDQZJsjQnDbz9Xv-rG";
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
let device = {
  og1ii: "",
  kezman22: "c3e9e9038e921489b7106d098ca11128b330ae36",
  simplywojtek: ""
};

let url = `${AUTHORIZE}?client_id=${clientId}&response_type=code&redirect_uri=${encodeURI(
  redirectUri
)}&show_dialog=true&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private`;

let refreshToken =
  "AQCYs0az-dh95MDuWB72JAruSc4rj821ERIEK4RpMsEvsQqp5pyzsaqu9kMbqUKsamCI2_gzqyNDkFEEIXE0pHvVX_3_1c3XjfyT-S2NXYKSPl7Ms3w1ZKxsq9ZInJZiezY";

let code = {
  og1ii: "",
  kezman22:
    "AQBI4mEpfr0ZvHx66OW2hQxuzs4KnN-jgyROVHk7sbxc92TnfYv8R7odn7_QluERmRXKfog4kfVpw0Ad760wKCtIeIKgtTzmhdZyINZYiTZu_iLksaJw8s2Mnv9LNGz5BznCMBC5_HROwvS5yEI4pYrEG_lHpgbw-9IMW1XE4uLYDLwU94NmS6q1_pcHP4SxRseSxt6bRy2A0jQ4UoAh8wDklJraAXVC3vWtcww6vHHnmMRpqwsRfY1DXaijWInIRaQZGgJekLWm4NJa9vtKtEFjz-N-eO9Zwo8uJXZZ-o5xub0fQUSdy3K6DEgJfRiCkUngZd49TExmhUaLnDQB2J-PyGnlFqtOIR5HhSdzRR4MQANsvDvTz5kJYRxKe_l4yUK_OG7slufQ6qsiXXswkLN7FBnub1ClkqIHkF0NS4j5lBkSSqEIAI1vK2wM4SVeJMvYsjO72RYBA2tsuu45Kavtc4iT2XW1NlKJID7zIfr2tuhoL076HCYSYfIUIBuclHKWaGPTNQq6DXOFuNK9shnQ2xVc0pMVb4GEMW_gXzFuVawONgCbGfKosoF67-4LY6bQXV19KnXAYT6U7tSWJDI-wIO2LG-rVHI5bqrnjYiEuuiXmU37MfdbCj8aLih_1QAQjFEvUQrO3z9f0n-pO9ziexlTVvvY_G7sPsL-zo2-7UkSHcL5ieJhMGvj3YXXHLlTq9LFcL2ZRsjmy_SuXB2fQ3is37H5BPbtZg",
  simplywojtek: ""
};
let currentPlaylist = { og1ii: "", kezman22: "", simplywojtek: "" };
let action = "";

const runApi = () => {};

const startSong = async (streamer) => {
  await refreshAccessToken();

  let body = {};
  body.position_ms = positionMs;

  await callApi(
    "PUT",
    PLAY + "?device_id=" + device[streamer],
    JSON.stringify(body),
    handleApiResponse
  );
};

const pauseSong = async (streamer) => {
  await refreshAccessToken()
  await callApi(
    "PUT",
    PAUSE + "?device_id=" + device[streamer],
    null,
    handleApiResponse
  );
  

  console.log("pausesong");
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
  console.log("refresh ti");
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
    "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64")
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
    
    if(action === "pause"){
        pauseSong      
    }
        
    if(action === "start"){
      startSong
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
  console.log("stop albo start");
  if (this.status == 200) {
    console.log(this.responseText, "response");
    action = ""
    setTimeout(currentlyPlaying, 1000);
  } else if (this.status == 204) {
    setTimeout(currentlyPlaying, 1000);
  } else if (this.status == 401) {
    console.log("stary token");
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
  console.log("sco gra");
  callApi("GET", PLAYER + "?market=US", null, handleCurrentlyPlayingResponse);
}


function refreshDevices() {
  callApi("GET", "https://api.spotify.com/v1/me/player/devices", null, handleDevicesResponse);
}

function handleDevicesResponse() {
  if (this.status == 200) {
    const data = JSON.parse(this.responseText);
    console.log(data, "handleDevicesResponse");
    console.log(data.devices, "deeeeee") ;
  } else if (this.status == 401) {
    refreshAccessToken();
  } else {
    console.log(this.responseText);

  }
}

module.exports = { pauseSong, startSong, runApi, refreshAccessToken, refreshDevices };
