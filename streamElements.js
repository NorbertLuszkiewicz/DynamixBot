const axios = require("axios");
const { startSong } = require("./spotify");

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

const getSpotifyAreaData = async (streamer, area) => {
  try {
    const { data } = await axios.get(
      `${url}songrequest/${clientId[streamer]}/${area}`,
      {
        headers: {
          Authorization: `Bearer ${clientSecret[streamer]}`
        }
      }
    );

    return data;
  } catch ({ response }) {
    console.log(
      `Error while getting ${area} (${response.status} ${response.statusText})`
    );
  }
};

const getSpotifyData = async (streamer, data) => {
  data({
    player: await getSpotifyAreaData(streamer, "player"),
    playing: await getSpotifyAreaData(streamer, "playing"),
    queue: await getSpotifyAreaData(streamer, "queue")
  });
};

const songPlayingNow = (streamer, done) => {
  getSpotifyData(streamer, data => {
    done(
      data.player.state == "playing" && data.playing != null,
      data.playing && data.playing.title,
      data.playing && `https://www.youtube.com/watch?v=${data.playing.videoId}`
    );
  });
};

const timeRequest = async (streamer, action) => {
  try {
    const player = await getSpotifyAreaData(streamer, "player");
    const playing = await getSpotifyAreaData(streamer, "playing");
    const queue = await getSpotifyAreaData(streamer, "queue");

    let now = Date.now();

    setTimeout(() => {
      if (action == "add") {
        if (!endTime || endTime < now) {
          queue.length == 0
            ? (endTime = parseInt(playing ? playing.duration : 0) * 1000 + now)
            : (endTime =
                parseInt(queue[queue.length - 1].duration) * 1000 + now);
        } else if (endTime > now) {
          queue.length == 0
            ? (endTime = parseInt(playing.duration) * 1000 + endTime)
            : (endTime =
                endTime + parseInt(queue[queue.length - 1].duration) * 1000);
        }
      }
      if (action == "skip") {
        setTimeout(() => {
          if (playing) {
            if (queue.length != 0) {
              let allQueueTime = 0;
              queue.forEach(item => {
                allQueueTime += parseInt(item.duration);
              });

              endTime =
                (parseInt(playing.duration) + allQueueTime) * 1000 + now;
            } else {
              endTime = parseInt(playing.duration) * 1000 + now;
            }
          }
        }, 1000);
      }

      setTimeout(() => {
        getSpotifyData(streamer, data => {
          if (!data.playing) {
            startSong(streamer);
            endTime = null;
          }
        });
      }, endTime - now + 2000);
    });
  } catch (err) {
    console.log(`Error while changging volume on time ${err}`);
  }
};

module.exports = {
  getSpotifyData,
  songPlayingNow,
  timeRequest
};
