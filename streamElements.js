const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const axios = require("axios");
const { startSong } = require("./spotifyBot");

const clientId = {
  kezman22: process.env.SR_CLIENT_ID_KEZMAN,
  og1ii: process.env.SR_CLIENT_ID_OGI,
  simplywojtek: process.env.SR_CLIENT_ID_WOJTEK
};
const clientSecret = {
  kezman22: process.env.SR_CLIENT_SECRET_KEZMAN,
  og1ii: process.env.SR_CLIENT_SECRET_OGI,
  simplywojtek: process.env.SR_CLIENT_SECRET_WOJTEK
};
const url = "https://api.streamelements.com/kappa/v2/";
let endTime;

const getPlayer = async (streamer) => {
  try {
    const { data } = await axios.get(
      `${url}songrequest/${clientId[streamer]}/player`,
      {
        headers: {
          Authorization: `Bearer ${clientSecret[streamer]}`,
        },
      }
    );
    console.log(data, " getplayer");
    return data;
  } catch ({ response }) {
    console.log(
      `Error while getting player (${response.status} ${response.statusText})`
    );
  }
};

const getPlaying = async (streamer) => {
  try {
    const { data } = await axios.get(
      `${url}songrequest/${clientId[streamer]}/playing`,
      {
        headers: {
          Authorization: `Bearer ${clientSecret[streamer]}`,
        },
      }
    );
    return data;
  } catch ({ response }) {
    console.log(
      `Error while getting playing (${response.status} ${response.statusText})`
    );
  }
};

const getQueue = async (streamer) => {
  try {
    const { data } = await axios.get(
      `${url}songrequest/${clientId[streamer]}/queue`,
      {
        headers: {
          Authorization: `Bearer ${clientSecret[streamer]}`,
        },
      }
    );
    return data;
  } catch ({ response }) {
    console.log(
      `Error while getting playing (${response.status} ${response.statusText})`
    );
  }
};

const returnSpotifyData = async (streamer) => {

  return {
    player: await getPlayer(streamer),
    playing: await getPlaying(streamer),
    queue: await getQueue(streamer),
  }
};

const songPlayingNow = (streamer, done) => {
  returnSpotifyData(streamer, data => {
    console.log(data, data.player.state, data.playing)
    done(
      data.player.state == "playing" && data.playing != null,
      (data.playing ? data.playing.title : null),(data.playing ? "https://www.youtube.com/watch?v=" + data.playing.videoId : null)
      
    );
  });
};

const timeRequest = (streamer, action) => {
  returnSpotifyData(
    streamer,
    data => {
      let now = Date.now();
      console.log(data, "data");
      setTimeout(() => {
        console.log(data, "data po 1s", data.queue[data.queue.length - 1]);
        if (action == "add") {
          if (!endTime || endTime < now) {
            data.queue.length == 0
              ? (endTime =
                  parseInt(data.playing ? data.playing.duration : 0) * 1000 +
                  now)
              : (endTime =
                  parseInt(data.queue[data.queue.length - 1].duration) * 1000 +
                  now);
          } else if (endTime > now) {
            data.queue.length == 0
              ? (endTime = parseInt(data.playing.duration) * 1000 + endTime)
              : (endTime =
                  endTime +
                  parseInt(data.queue[data.queue.length - 1].duration) * 1000);
          }
        }
        if (action == "skip") {
          setTimeout(() => {
            if (data.playing) {
              if (data.queue.length != 0) {
                let allQueueTime = 0;
                data.queue.forEach(item => {
                  allQueueTime += parseInt(item.duration);
                });

                endTime =
                  (parseInt(data.playing.duration) + allQueueTime) * 1000 + now;
              } else {
                endTime = parseInt(data.playing.duration) * 1000 + now;
              }
            }
          }, 1000);
        }

        console.log(data);

        console.log(endTime - now);

        setTimeout(() => {
          returnSpotifyData(streamer, data => {
            if (!data.playing) {
              startSong(streamer);
              endTime = null;
            }
          });
        }, endTime - now + 2000);
      });
    },
    1000
  );
};

module.exports = {
  returnSpotifyData,
  songPlayingNow,
  timeRequest
};
