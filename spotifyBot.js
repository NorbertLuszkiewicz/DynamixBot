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
  og1ii: process.env.DEVICE_OGI ,
  dynam1x1: process.env.DEVICE_DYNAMIX ,
  kezman22: process.env.DEVICE_KEZMAN,
  simplywojtek: process.env.DEVICE_WOJTEK,
};

let refreshTokenList = {
  og1ii:
    "AQCYs0az-dh95MDuWB72JAruSc4rj821ERIEK4RpMsEvsQqp5pyzsaqu9kMbqUKsamCI2_gzqyNDkFEEIXE0pHvVX_3_1c3XjfyT-S2NXYKSPl7Ms3w1ZKxsq9ZInJZiezY",
  dynam1x1:
    "AQCg9rcXt-DPSVtz9rEqE3fA1x78NqvV6nysu5T9O1EZ1wFWmMJw3yO2budF5OknAiKM5geXUKPXk0Z2RnHm9DMD294V_WdcHJ9Wq4Meg3oRA7YYopjM0sSfpMC1qjQu-w8",  
  kezman22:
    "AQARUA5cDjZDt0Bv-5ZOPVOj9u3i_Mio7XvW61jBLGCMOKl5x1xFw_gqieiIN5P5kSsWMkqCEmXm4uMmCRk8QsujTEhjRhYx5NuyvgikcTc6C47j12dp-BRxYAEPSOZ4l3g",
  simplywojtek: "AQBhH6yBoKlt5nWUuJ0lkD5FUdN9OP_5PLtZozdWbHZ5Azfu1fz7moPnzEFeP2ClvD82CfNXkS504SLSwSJEmz-WFbxj8uviA8B927lkNlBgAS6CGKIp52YjuL5La-2fjpU" 
};

let accessTokenList = {
  og1ii:
    "BQBujnjEobElD-6NrVgSYQrHbMzVKy8R8HnYOyZXwZMne-vmupE8wruoSWU58ytwsRtYEZKPpqNQ2ICdlTyC0IzGjJJsYusNyNCDDrmdFutUFn7mSjLIvkNpQyHfhsrx6aT0ysgc7_kDYPPx3A2LOjNsxQDksJG44W-hAb8MnHzkslxBZmmtXfBqZc2UYz1WYCY2txOgB4DVbgbiHphW9a7fAL3fnqRtC-ZrY20Ji_14GqNaEWSB4pmHel3FhD_XvdSY2PNKT3CFcXFDQZJsjQnDbz9Xv-rG",
  dynam1x1:
    "BQAJ4xsBe8xP9tRyUkDlDC5zmgxK6y2HvUqW_fjXQ3e7RphcC-DIvex6DlA09PamCBmiArNikMiIBcu8jhQifHTJ5zEOlTXpn32L_s0gOZhT_WV-YIwZebkxtn25xV8bl88oo-wMq5GkBRzjqAVfCLtTTKgZqTaILDuMiHThXoUJUMnreFnWetIaFuPh9LeBV5pXo3mQlFc_QyO3wGwNa725Rg",
  simplywojtek: "BQALo0dMXY0AgNIY14InjDAxX-OPVdYd0c2crRBRv-kSSS_srVlCGMNufH2AEeWmWXee8yWTNB2V3LTLwHged38ZyJKIh2x8imSE-MQmFTpRLO3EX8kvX2uSaCyzAnl-3Z0siDZQZ0shjYUmQolR7f4aq45DyzGUCaqGTBpGf9HRai0gj0gxqz2r2Vcarf7dmEeQJCrEP4mCMTOlLDJ3jXI2JCibdSn7D7YSUPCWWWS9GbPPY2yxDp3ZlRReswJZmjnwNzYw8s5L_WMn8rRhYbiixzAK9DFgMQoCmA",
  kezman22:
    "BQBCwAtXVoIC_MmGrKGVtOBXWELImybf_lmm2W9Ccj8u6YCOCQSAX7jt9kVfWg1LztAApu9a6JKgBA7W4TqnytEeSDvIzWBbTOsFus-w9XHYnJvuzf_b7IGu8b0Ss2NZbzIY8VSaZYLEFF08X6kjCrGF5imyjDhimCNauJipt1T3ZBYc4GCOeXorqbKct4OGXWZRSeJxZfR-CkkACFvJeWxJ02jAVMKxCLKOg9I9pDzSkNPrTZpCWN0SYOlK2rRPVRjRx07UdhUfEZo7KvF9_mArzIvD",
};
let maxVolumeDate = null;
let timeMaxVolume = null;
let action = "";

const startSong = streamer => {
  let body = {};
  body.position_ms = positionMs;

  callApi(
    "PUT",
    PLAY + "?device_id=" + device[streamer],
    JSON.stringify(body),
    handleApiResponse,
    streamer
  );
};

const pauseSong = (streamer, callback) => {
  callApi(
    "PUT",
    PAUSE + "?device_id=" + device[streamer],
    null,
    () => this.status == 403 ? callback("error") : callback("200"),
    streamer
  );

};

const nextSong = streamer => {
  callApi(
    "POST",
    NEXT + "?device_id=" + device[streamer],
    null,
    handleApiResponse,
    streamer
  );
};
const changeVolumeOnTime = (streamer, min, max, time) => {
  callApi(
    "PUT",
    `${VOLUME}?volume_percent=${max}&device_id=${device[streamer]}`,
    null,
    handleApiResponse,
    streamer
  );
  
  let now = Date.now();

  if (maxVolumeDate > now) {
    maxVolumeDate += time;
  }

  if (!maxVolumeDate || maxVolumeDate < now) {
    maxVolumeDate = now + time;
  }

  clearTimeout(timeMaxVolume);
  timeMaxVolume = setTimeout(() => {
    callApi(
      "PUT",
      `${VOLUME}?volume_percent=${min}&device_id=${device[streamer]}`,
      null,
      handleApiResponse,
      streamer
    );
    
  }, maxVolumeDate - now);
};



const setVolume = (streamer, value) => {
  callApi(
    "PUT",
    `${VOLUME}?volume_percent=${value}&device_id=${device[streamer]}`,
    null,
    handleApiResponse,
    streamer
  );
};

function refreshAccessToken() {
  const bodyOgi = `grant_type=refresh_token&refresh_token=${refreshTokenList.og1ii}&client_id=${clientId}`;
  const bodyKezman = `grant_type=refresh_token&refresh_token=${refreshTokenList.kezman22}&client_id=${clientId}`;
  const bodySimplywojtek = `grant_type=refresh_token&refresh_token=${refreshTokenList.simplywojtek}&client_id=${clientId}`;

  callAuthorizationApi(bodyOgi, "og1ii");
  callAuthorizationApi(bodyKezman, "kezman22");
  callAuthorizationApi(bodySimplywojtek, "simplywojtek");
}

function callAuthorizationApi(body, streamer) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", TOKEN, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader(
    "Authorization",
    "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64")
  );
  xhr.send(body);
  xhr.onload = function ()  {
    if (this.status == 200) {
      let data = JSON.parse(this.responseText);
      console.log("reset token sporify");

      if (data.access_token != undefined) {
        accessTokenList[streamer] = data.access_token;
      }
      if (data.refresh_token != undefined) {
        refreshTokenList[streamer] = data.refresh_token;
      }
    } else {
      console.log(this.responseText);
    }
  };
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

  } else if (this.status == 401) {
    console.log("stary token");
    refreshAccessToken();
  } else {
    console.log(this.responseText);
  }
}


function currentlyPlaying(streamer, callback) {
  console.log("sprawdza")
  callApi(
    "GET",
    PLAYER + "?market=US",
    null,
    function() {
    let datax = JSON.parse(this.responseText);
      positionMs = datax.progress_ms;
    callback(datax)
  },
    streamer
  );
}

function refreshDevices(streamer) {
  callApi(
    "GET",
    "https://api.spotify.com/v1/me/player/devices",
    null,
    handleDevicesResponse,
    streamer
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

module.exports = {
  pauseSong,
  startSong,
  nextSong,
  refreshAccessToken,
  refreshDevices,
  changeVolumeOnTime,
  setVolume,
  currentlyPlaying
};
