var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const TOKEN = "https://accounts.spotify.com/api/token";
const PLAY = "https://api.spotify.com/v1/me/player/play";
const PAUSE = "https://api.spotify.com/v1/me/player/pause";
const NEXT = "https://api.spotify.com/v1/me/player/next";
const VOLUME = "https://api.spotify.com/v1/me/player/volume";
const PLAYER = "https://api.spotify.com/v1/me/player";
const CURRENTLYPLAYING =
  "https://api.spotify.com/v1/me/player/currently-playing";
let positionMs = 0;
let device = {
  og1ii: "a00eb394fa4f0ec58111f49101d974acc67b2157",
  kezman22: "c3e9e9038e921489b7106d098ca11128b330ae36",
  simplywojtek: "",
};

let refreshTokenList = {
  og1ii:
    "AQCYs0az-dh95MDuWB72JAruSc4rj821ERIEK4RpMsEvsQqp5pyzsaqu9kMbqUKsamCI2_gzqyNDkFEEIXE0pHvVX_3_1c3XjfyT-S2NXYKSPl7Ms3w1ZKxsq9ZInJZiezY",
  kezman22:
    "AQCg9rcXt-DPSVtz9rEqE3fA1x78NqvV6nysu5T9O1EZ1wFWmMJw3yO2budF5OknAiKM5geXUKPXk0Z2RnHm9DMD294V_WdcHJ9Wq4Meg3oRA7YYopjM0sSfpMC1qjQu-w8",
  simplywojtek: "",
};

let accessTokenList = {
  og1ii:
    "BQBujnjEobElD-6NrVgSYQrHbMzVKy8R8HnYOyZXwZMne-vmupE8wruoSWU58ytwsRtYEZKPpqNQ2ICdlTyC0IzGjJJsYusNyNCDDrmdFutUFn7mSjLIvkNpQyHfhsrx6aT0ysgc7_kDYPPx3A2LOjNsxQDksJG44W-hAb8MnHzkslxBZmmtXfBqZc2UYz1WYCY2txOgB4DVbgbiHphW9a7fAL3fnqRtC-ZrY20Ji_14GqNaEWSB4pmHel3FhD_XvdSY2PNKT3CFcXFDQZJsjQnDbz9Xv-rG",
  kezman22:
    "BQAJ4xsBe8xP9tRyUkDlDC5zmgxK6y2HvUqW_fjXQ3e7RphcC-DIvex6DlA09PamCBmiArNikMiIBcu8jhQifHTJ5zEOlTXpn32L_s0gOZhT_WV-YIwZebkxtn25xV8bl88oo-wMq5GkBRzjqAVfCLtTTKgZqTaILDuMiHThXoUJUMnreFnWetIaFuPh9LeBV5pXo3mQlFc_QyO3wGwNa725Rg",
  simplywojtek: "",
};
let maxVolumeDate = null;
let timeMaxVolume = null;
let action =""

let currentPlaylist = { og1ii: "", kezman22: "", simplywojtek: "" };

const startSong = async (streamer) => {
  await refreshAccessToken();

  let body = {};
  body.position_ms = positionMs;

  await callApi(
    "PUT",
    PLAY + "?device_id=" + device[streamer],
    JSON.stringify(body),
    handleApiResponse,
    streamer
  );
};

const pauseSong = async (streamer) => {
  await refreshAccessToken();
  await callApi(
    "PUT",
    PAUSE + "?device_id=" + device[streamer],
    null,
    handleApiResponse,
    streamer
  );

  console.log("pausesong");
};

const nextSong = (streamer) => {
  callApi(
    "POST",
    NEXT + "?device_id=" + device[streamer],
    null,
    handleApiResponse
  );
};
const changeVolume = (streamer) => {
  callApi(
    "PUT",
    `${VOLUME}?volume_percent=${100}&device_id=${device[streamer]}`,
    null,
    handleApiResponse
  );
  let now = Date.now();
  console.log(now);

  if (maxVolumeDate > now) {
    maxVolumeDate += 5000;
  }

  if (!maxVolumeDate || maxVolumeDate < now) {
    maxVolumeDate = now + 5000;
  }

  clearTimeout(timeMaxVolume);
  timeMaxVolume = setTimeout(() => {
    callApi(
      "PUT",
      `${VOLUME}?volume_percent=${20}&device_id=${device[streamer]}`,
      null,
      handleApiResponse
    );
  }, maxVolumeDate - now);
};

function refreshAccessToken() {
  let bodyOgi = `grant_type=refresh_token&refresh_token=${refreshTokenList.og1ii}&client_id=${clientId}`;
  let bodyKezman = `grant_type=refresh_token&refresh_token=${refreshTokenList.kezman22}&client_id=${clientId}`;

  callAuthorizationApi(bodyOgi, "og1ii");
  callAuthorizationApi(bodyKezman, "kezman22");
}

function callAuthorizationApi(body, streamer) {
  
  console.log(body, streamer)
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
      accessTokenList[streamer] = data.access_token;
    }
    if (data.refresh_token != undefined) {
      refreshTokenList[streamer] = data.refresh_token;
    }
  } else {
    console.log(this.responseText);
  }
}

function callApi(method, url, body, callback, streamer) {
  let xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + accessTokenList[streamer]);
  xhr.send(body);
  xhr.onload = callback;
}

function handleApiResponse() {
  console.log("stop albo start");
  if (this.status == 200) {
    console.log(this.responseText, "response");
    action = "";
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

function currentlyPlaying(streamer) {
  console.log("sco gra");
  callApi(
    "GET",
    PLAYER + "?market=US",
    null,
    handleCurrentlyPlayingResponse,
    streamer
  );
}

function refreshDevices() {
  callApi(
    "GET",
    "https://api.spotify.com/v1/me/player/devices",
    null,
    handleDevicesResponse
  );
}

function handleDevicesResponse() {
  if (this.status == 200) {
    const data = JSON.parse(this.responseText);
    console.log(data, "handleDevicesResponse");
    console.log(data.devices, "deeeeee");
  } else if (this.status == 401) {
    refreshAccessToken();
  } else {
    console.log(this.responseText);
  }
}


module.exports = {   pauseSong,
  startSong,
  nextSong,
  refreshAccessToken,
  refreshDevices,
  changeVolume, };
