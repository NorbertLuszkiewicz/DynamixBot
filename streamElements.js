const axios = require("axios");
const { startSong } = require("./spotify");
const {
  getAllUser,
  updateUser,
  getUser
} = require("./controllers/UserController.js");

const url = "https://api.streamelements.com/kappa/v2/";
let endTime;

const getSpotifyAreaData = async (streamer, area) => {
  try {
    const [user] = await getUser(streamer);
    const { clientSongRequestID, clientSongRequestSecret } = user;
    
    const { data } = await axios.get(
      `${url}songrequest/${clientSongRequestID}/${area}`,
      {
        headers: {
          Authorization: `Bearer ${clientSongRequestSecret}`
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

const songPlayingNow = async (streamer, done) => {
  try {
    const player = await getSpotifyAreaData(streamer, "player");
    const playing = await getSpotifyAreaData(streamer, "playing");

    done(
      player.state == "playing" && playing != null,
      playing && playing.title,
      playing && `https://www.youtube.com/watch?v=${playing.videoId}`
    );
  } catch (err) {
    console.log(`Error while checking what song playing now ${err}`);
  }
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
        if (!playing) {
          startSong(streamer);
          endTime = null;
        }
      }, endTime - now + 2000);
    });
  } catch (err) {
    console.log(`Error while changging volume on time ${err}`);
  }
};

module.exports = {
  songPlayingNow,
  timeRequest
};
