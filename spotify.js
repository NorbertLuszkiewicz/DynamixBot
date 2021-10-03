const axios = require("axios");

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
const PLAY = "https://api.spotify.com/v1/me/player/play";
const PAUSE = "https://api.spotify.com/v1/me/player/pause";
const NEXT = "https://api.spotify.com/v1/me/player/next";
const VOLUME = "https://api.spotify.com/v1/me/player/volume";
const PLAYER = "https://api.spotify.com/v1/me/player";
const DEVICES = "https://api.spotify.com/v1/me/player/devices";

let positionMs = 0;
let device = {
  og1ii: process.env.DEVICE_OGI,
  dynam1x1: "c3e9e9038e921489b7106d098ca11128b330ae36",
  kezman22: process.env.DEVICE_KEZMAN,
  simplywojtek: process.env.DEVICE_WOJTEK
};

let refreshTokenList = {
  og1ii:
    "AQCYs0az-dh95MDuWB72JAruSc4rj821ERIEK4RpMsEvsQqp5pyzsaqu9kMbqUKsamCI2_gzqyNDkFEEIXE0pHvVX_3_1c3XjfyT-S2NXYKSPl7Ms3w1ZKxsq9ZInJZiezY",
  dynam1x1:
    "AQDZ1nmBW5nL_uy1Xlp8-hP2aikNfvIeZ61WcF_rTd6LcpRx82hjR5CzDPRoiIEjREPugOBT8eDPLLVOX1Y65QP05xBRt_Dwc0TosNGb1ZUiREL_a4j95WaI_5OiB6GuDWc",
  kezman22:
    "AQCwPwSguFEGHJzur_77FVLqMK3z1S5N05OpeM2iVSYT7IjhPZr1SwWouWJEB3gGe31ig9Jo3TBK8jWHr4sn7BWQ_5tnXqk_G3M_vamoFe0y1wBLVtrPIx9PJ9qRfrv2HGQ",
  simplywojtek:
    "AQBhH6yBoKlt5nWUuJ0lkD5FUdN9OP_5PLtZozdWbHZ5Azfu1fz7moPnzEFeP2ClvD82CfNXkS504SLSwSJEmz-WFbxj8uviA8B927lkNlBgAS6CGKIp52YjuL5La-2fjpU"
};

let accessTokenList = {
  og1ii:
    "BQBujnjEobElD-6NrVgSYQrHbMzVKy8R8HnYOyZXwZMne-vmupE8wruoSWU58ytwsRtYEZKPpqNQ2ICdlTyC0IzGjJJsYusNyNCDDrmdFutUFn7mSjLIvkNpQyHfhsrx6aT0ysgc7_kDYPPx3A2LOjNsxQDksJG44W-hAb8MnHzkslxBZmmtXfBqZc2UYz1WYCY2txOgB4DVbgbiHphW9a7fAL3fnqRtC-ZrY20Ji_14GqNaEWSB4pmHel3FhD_XvdSY2PNKT3CFcXFDQZJsjQnDbz9Xv-rG",
  dynam1x1:
    "BQCn8j4JkYaxVUK_bIft2NYhBjM_EkOUIHqKKyrM_cztAV61GDtwBp879QnFvxrkkFEHY038wgpXqAGsGJa24asCFSMA80c8zN3DmR1mCvWg2FrV4W-m_ZqUWoZ8URWpsk0PBspVFWMhHDHN-rnO_OvgcRzGMrVjW1Z54EPZU3AGDbHRV5JV1p8THp01vWnjsWyVAhRWWA2-4nkUJA2cL5mWvW9kNzaVmkewejio7VnoxNkwxBeH8jjVahtSRV2yeOve8JuqIZdhBYw3fnLXVLp9R6SU_miosfM",
  simplywojtek:
    "BQALo0dMXY0AgNIY14InjDAxX-OPVdYd0c2crRBRv-kSSS_srVlCGMNufH2AEeWmWXee8yWTNB2V3LTLwHged38ZyJKIh2x8imSE-MQmFTpRLO3EX8kvX2uSaCyzAnl-3Z0siDZQZ0shjYUmQolR7f4aq45DyzGUCaqGTBpGf9HRai0gj0gxqz2r2Vcarf7dmEeQJCrEP4mCMTOlLDJ3jXI2JCibdSn7D7YSUPCWWWS9GbPPY2yxDp3ZlRReswJZmjnwNzYw8s5L_WMn8rRhYbiixzAK9DFgMQoCmA",
  kezman22:
    "BQBCwAtXVoIC_MmGrKGVtOBXWELImybf_lmm2W9Ccj8u6YCOCQSAX7jt9kVfWg1LztAApu9a6JKgBA7W4TqnytEeSDvIzWBbTOsFus-w9XHYnJvuzf_b7IGu8b0Ss2NZbzIY8VSaZYLEFF08X6kjCrGF5imyjDhimCNauJipt1T3ZBYc4GCOeXorqbKct4OGXWZRSeJxZfR-CkkACFvJeWxJ02jAVMKxCLKOg9I9pDzSkNPrTZpCWN0SYOlK2rRPVRjRx07UdhUfEZo7KvF9_mArzIvD"
};
let maxVolumeDate = null;
let timeMaxVolume = null;

const addNewUser = (code, callback) => {
  let accessToken;
  let refreshToken;
  const body = `grant_type=authorization_code&code=${code}&redirect_uri=https://dynamix-bot.glitch.me/callback`;

  axios
    .post(`${TOKEN}`, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          clientId + ":" + clientSecret
        ).toString("base64")}`
      }
    })
    .then(({ data }) => {
      data.access_token && (accessToken = data.access_token);
      data.refresh_token && (refreshToken = data.refresh_token);
      console.log("accessToken", data.access_token);
      console.log("refreshToken", data.refresh_token);
      callback("success");
    })
    .catch(({ response }) => {
      console.log(
        `Error while getting first token (${response.status} ${response.statusText})`
      );
      callback("error");
    });
};

const startSong = streamer => {
  let body = { position_ms: positionMs };

  axios
    .put(`${PLAY}?device_id=${device[streamer]}`, JSON.stringify(body), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessTokenList[streamer]}`
      }
    })
    .catch(({ response }) =>
      console.log(
        `Error while starting song (${response.status} ${response.statusText})`
      )
    );
};

const pauseSong = streamer => {
  axios
    .put(
      `${PAUSE}?device_id=${device[streamer]}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessTokenList[streamer]}`
        }
      }
    )
    .catch(({ response }) =>
      console.log(
        `Error while stopping song (${response.status} ${response.statusText})`
      )
    );
};

const nextSong = streamer => {
  axios
    .post(
      `${NEXT}?device_id=${device[streamer]}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessTokenList[streamer]}`
        }
      }
    )
    .catch(({ response }) =>
      console.log(
        `Error while skipping song (${response.status} ${response.statusText})`
      )
    );
};

const changeVolumeOnTime = (streamer, min, max, time) => {
  axios
    .put(
      `${VOLUME}?volume_percent=${max}&device_id=${device[streamer]}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessTokenList[streamer]}`
        }
      }
    )
    .catch(({ response }) =>
      console.log(
        `Error while volume changes to higher (${response.status} ${response.statusText})`
      )
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
    axios
      .put(
        `${VOLUME}?volume_percent=${min}&device_id=${device[streamer]}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessTokenList[streamer]}`
          }
        }
      )
      .catch(({ response }) =>
        console.log(
          `Error while volume changes to lower (${response.status} ${response.statusText})`
        )
      );
  }, maxVolumeDate - now);
};

const setVolume = (streamer, value) => {
  axios
    .put(
      `${VOLUME}?volume_percent=${value}&device_id=${device[streamer]}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessTokenList[streamer]}`
        }
      }
    )
    .catch(({ response }) =>
      console.log(
        `Error while volume changes (${response.status} ${response.statusText})`
      )
    );
};

function refreshAccessToken() {
  Object.keys(accessTokenList).forEach(streamer => {
    const body = `grant_type=refresh_token&refresh_token=${refreshTokenList[streamer]}&client_id=${clientId}`;

    axios
      .post(`${TOKEN}`, body, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            clientId + ":" + clientSecret
          ).toString("base64")}`
        }
      })
      .then(({ data }) => {
        console.log("reset spotify token");
        data.access_token && (accessTokenList[streamer] = data.access_token);
        data.refresh_token && (refreshTokenList[streamer] = data.refresh_token);
      })
      .catch(({ response }) =>
        console.log(
          `Error while resetting Spotify token (${response.status} ${response.statusText})`
        )
      );
  });
}

function currentlyPlaying(streamer, callback) {
  axios
    .get(`${PLAYER}?market=US`, {
      headers: {
        Authorization: `Bearer ${accessTokenList[streamer]}`
      }
    })
    .then(({ data }) => {
      positionMs = data.progress_ms;
      callback = data;
    })
    .catch(({ response }) =>
      console.log(
        `Error while getting currently song (${response.status} ${response.statusText})`
      )
    );
}

function refreshDevices(streamer) {
  axios
    .get(DEVICES, {
      headers: {
        Authorization: `Bearer ${accessTokenList[streamer]}`
      }
    })
    .then(({ data }) => {
      console.log("devices", data);
    })
    .catch(({ response }) =>
      console.log(
        `Error while getting devices (${response.status} ${response.statusText})`
      )
    );
}

module.exports = {
  pauseSong,
  startSong,
  nextSong,
  refreshAccessToken,
  refreshDevices,
  changeVolumeOnTime,
  setVolume,
  currentlyPlaying,
  addNewUser
};
