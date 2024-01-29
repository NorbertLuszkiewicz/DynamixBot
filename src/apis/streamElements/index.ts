import axios from "axios";
import { startSong } from "../spotify";
import { isBlockedVideo } from "../youtube";
import { getAllUser, updateUser, getUser } from "../../controllers/UserController.js";

const url = "https://api.streamelements.com/kappa/v2/";

let timeoutVolume = {};

export const setTimeoutVolume = async () => {
  try {
    const allUsers = await getAllUser();

    timeoutVolume = allUsers.reduce((acc, key) => ({ ...acc, [key.streamer]: null }), {});
  } catch {
    console.log("Error when call setTimeoutVolume");
  }
};

export const getSpotifyAreaData = async (streamer, area) => {
  try {
    const [user] = await getUser(streamer);
    const { clientSongRequestID, clientSongRequestSecret } = user;

    const { data } = await axios.get(`${url}songrequest/${clientSongRequestID}/${area}`, {
      headers: {
        Authorization: `Bearer ${clientSongRequestSecret}`,
      },
    });

    return data;
  } catch ({ response }) {
    console.log(`Error while getting ${area} (${response.status} ${response.statusText})`);
  }
};

export const songPlayingNow = async streamer => {
  try {
    const player = await getSpotifyAreaData(streamer, "player");
    const playing = await getSpotifyAreaData(streamer, "playing");
    console.log(player, playing);

    return {
      isPlayingNow: player.state == "playing" && playing != null,
      title: playing && playing.title,
      link: playing && `https://www.youtube.com/watch?v=${playing.videoId ? playing.videoId : playing.song.videoId}`,
      userAdded: playing?.user?.username,
    };
  } catch (err) {
    console.log(`Error while checking what song playing now ${err}`);
  }
};

export const lastSongPlaying = async streamer => {
  try {
    const player = await getSpotifyAreaData(streamer, "player");
    const playing = await getSpotifyAreaData(streamer, "playing");
    const [user] = await getUser(streamer);
    const { clientSongRequestID, clientSongRequestSecret } = user;
    const history = await getHistorySR(clientSongRequestID, clientSongRequestSecret, 1, 0);

    return {
      isPlayingNow: player.state == "playing" && playing != null,
      title: history && history[0].song.title,
      link: history && `https://www.youtube.com/watch?v=${history[0].song.videoId}`,
      userAdded: history[0].song?.user?.username,
    };
  } catch (err) {
    console.log(`Error while checking what last song streamelemets ${err}`);
  }
};

export const setSongAsPlay = async (streamer, state) => {
  try {
    const [user] = await getUser(streamer);
    const { clientSongRequestID, clientSongRequestSecret } = user;

    await axios.post(
      `${url}songrequest/${clientSongRequestID}/player/${state}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${clientSongRequestSecret}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
  } catch ({ response }) {
    console.log(`Error while setSongAsPlay (${response.status} ${response.statusText})`);
  }
};

export const getHistorySR = async (clientSongRequestID, clientSongRequestSecret, limit = 100, offset = 0) => {
  try {
    const { data } = await axios.get(
      `${url}songrequest/${clientSongRequestID}/history?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${clientSongRequestSecret}`,
        },
      }
    );
    return data?.history;
  } catch ({ response }) {
    console.log(`Error while getHistorySR (${response.status} ${response.statusText})`);
  }
};

export const timeRequest = async (streamer, action) => {
  try {
    let playing = await getSpotifyAreaData(streamer, "playing");
    const queue = await getSpotifyAreaData(streamer, "queue");
    const [user] = await getUser(streamer);
    const { endTime } = user;

    let now = Date.now();

    if (action === "add") {
      let newEndTime;

      if (playing && playing.duration && queue.length == 0) {
        newEndTime = playing.duration * 1000;

        await updateUser({
          streamer: streamer,
          endTime: newEndTime + now,
        });
      }

      if (!playing && queue.length == 1) {
        newEndTime = queue[0].duration * 1000;

        await updateUser({
          streamer: streamer,
          endTime: newEndTime + now,
        });
      }

      if (playing && queue.length > 0) {
        if (endTime > now) {
          newEndTime = endTime - now + queue[queue.length - 1].duration * 1000;

          await updateUser({
            streamer: streamer,
            endTime: newEndTime + now,
          });
        } else {
          let allQueueTimes = 0;
          queue.forEach(song => (allQueueTimes += song.duration));

          newEndTime = (allQueueTimes + playing.duration) * 1000;

          await updateUser({
            streamer: streamer,
            endTime: newEndTime + now,
          });
        }
      }

      clearTimeout(timeoutVolume[streamer]);

      timeoutVolume[streamer] = setTimeout(async () => {
        playing = await getSpotifyAreaData(streamer, "playing");

        !playing && startSong(streamer);
      }, newEndTime + 1450 * (queue.length + 3));
    }
    if (action === "skip") {
      if (playing) {
        let timeOfSongsInQueue = 0;
        queue.length > 0 ? queue.forEach(song => (timeOfSongsInQueue += song.duration)) : (timeOfSongsInQueue = 0);

        const timeOfAllSongs = (playing.duration + timeOfSongsInQueue) * 1000;

        await updateUser({
          streamer: streamer,
          endTime: timeOfAllSongs + now,
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

export const removeBlockedSong = async streamer => {
  try {
    const removedSongList = [];
    const [user] = await getUser(streamer);
    const { clientSongRequestID, clientSongRequestSecret } = user;
    const queue = await getSpotifyAreaData(streamer, "queue");
    const playing = await getSpotifyAreaData(streamer, "playing");
    const removeSong = song =>
      axios.delete(`${url}songrequest/${clientSongRequestID}/queue/${song}`, {
        headers: {
          Authorization: `Bearer ${clientSongRequestSecret}`,
        },
      });

    if (queue.length > 0) {
      queue.forEach(async song => {
        const isBlocked = await isBlockedVideo(null, streamer, song.videoId);
        if (!isBlocked.isVideo || isBlocked.isBlocked) {
          removeSong(song._id);
          removedSongList.push({
            user: song.user.username,
            title: song.title,
            reason: "usunięto z kolejki: ta piosenka jest zablokowana przez yt",
          });
        }
      });
    }

    if (playing) {
      const isBlocked = await isBlockedVideo(null, streamer, playing.videoId);
      if (!isBlocked.isVideo || isBlocked.isBlocked) {
        removeSong(playing._id);
        removedSongList.push({
          user: playing.user.username,
          title: playing.title,
          reason: "usunięto z kolejki: ta piosenka jest zablokowana przez yt",
        });
      }
    }

    //for overpow for now changed global in the future

    if (streamer.toLowerCase() === "overpow" || streamer.toLowerCase() === "dynam1x1") {
      const historyList = [];
      const fistPage = await getHistorySR(clientSongRequestID, clientSongRequestSecret, 100, 0);
      const secondPage = await getHistorySR(clientSongRequestID, clientSongRequestSecret, 100, 100);

      fistPage.forEach(x => historyList.push(x.song.videoId));
      secondPage.forEach(x => historyList.push(x.song.videoId));

      queue.slice(-2).forEach(async song => {
        if (song.source !== "tip") {
          if (historyList.find(x => x === song.videoId)) {
            removeSong(song._id);
            removedSongList.push({
              user: song.user.username,
              title: song.title,
              reason: "usunięto z kolejki: ten utwór był niedawno puszczany",
            });
          }

          if (queue.length > 2) {
            const queueVideoIdList = queue.slice(0, -2).map(x => x.videoId);
            if (queueVideoIdList.find(x => x === song.videoId)) {
              removeSong(song._id);
              removedSongList.push({
                user: song.user.username,
                title: song.title,
                reason: "usunięto z kolejki: ten utwór jest już w kolejce",
              });
            }
          }
        }
      });
    }

    return removedSongList;
  } catch (err) {
    console.log(`Error while checking what song playing now delete usless songs ${err}`);
  }
};
