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

const songPlayingNow = async streamer => {
  try {
    const player = await getSpotifyAreaData(streamer, "player");
    const playing = await getSpotifyAreaData(streamer, "playing");

    return {
      isPlayingNow: player.state == "playing" && playing != null,
      title: playing && playing.title,
      link: playing && `https://www.youtube.com/watch?v=${playing.videoId}`,
    };
  } catch (err) {
    console.log(`Error while checking what song playing now ${err}`);
  }
};

const timeRequest = async (streamer, action) => {
  try {
    const playing = await getSpotifyAreaData(streamer, "playing");
    const queue = await getSpotifyAreaData(streamer, "queue");
    const [user] = await getUser(streamer);
    const { endTime } = user;

    let now = Date.now();
    
    console.log({playing, queue})

    if (action === "skip") {
      
    }
  } catch (err) {
    console.log(`Error while changging volume on time ${err}`);
  }
};

module.exports = {
  songPlayingNow,
  timeRequest
};
