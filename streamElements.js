const axios = require("axios");
const { startSong } = require("./spotify");
const {
  getAllUser,
  updateUser,
  getUser
} = require("./controllers/UserController.js");

const url = "https://api.streamelements.com/kappa/v2/";
let endTime;
let timeoutVolume = {
  kezman22: null,
  dynam1x1: null
};

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
      link: playing && `https://www.youtube.com/watch?v=${playing.videoId}`
    };
  } catch (err) {
    console.log(`Error while checking what song playing now ${err}`);
  }
};

const timeRequest = async (streamer, action) => {
  try {
    let playing = await getSpotifyAreaData(streamer, "playing");
    const queue = await getSpotifyAreaData(streamer, "queue");
    const [user] = await getUser(streamer);
    const { endTime } = user;

    let now = Date.now();

    //console.log({ playing, queue });

    if (action === "add") {
      if (playing) {
        let timeOfSongsInQueue = 0;
        let timeOfAllSongs = 0
        queue.length > 0
          ? queue.forEach(song => (timeOfSongsInQueue += song.duration))
          : (timeOfSongsInQueue = 0);
  
      const timeOfSongPlayingNow = endTime > now ? 
        
            !timeOfSongsInQueue ? timeOfAllSongs = 
      

        

        await updateUser({
          streamer: streamer,
          endTime: timeOfAllSongs
        });
      } else {
        startSong(streamer);
      }
    }

    if (action === "skip") {
      if (playing) {
        let timeOfSongsInQueue = 0;
        queue.length > 0
          ? queue.forEach(song => (timeOfSongsInQueue += song.duration))
          : (timeOfSongsInQueue = 0);

        const timeOfAllSongs = (playing.duration + timeOfSongsInQueue) * 1000;

        await updateUser({
          streamer: streamer,
          endTime: timeOfAllSongs
        });

        clearTimeout(timeoutVolume[streamer]);

        timeoutVolume[streamer] = setTimeout(async () => {
          playing = await getSpotifyAreaData(streamer, "playing");

          !playing && startSong(streamer);
        }, timeOfAllSongs + 1000 * (queue.length + 1));
      } else {
        startSong(streamer);
      }
    }
  } catch (err) {
    console.log(`Error while changging volume on time ${err}`);
  }
};

module.exports = {
  songPlayingNow,
  timeRequest
};
