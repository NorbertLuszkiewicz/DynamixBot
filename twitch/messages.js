const {
  nextSong,
  pauseSong,
  startSong,
  refreshDevices,
  changeVolumeOnTime,
  setVolume
} = require("../spotify");

const {
  getAllUser,
  updateUser,
  getUser
} = require("../controllers/UserController.js");

const { songPlayingNow, timeRequest } = require("../streamElements");

const ComfyJS = require("comfy.js");

let maxVolumeDate = 0;
let timeMaxVolume = 0;
let timeCooldownTravis = 0;
let timeCooldownOgiii = 0;

const messages = () => {
  ComfyJS.onChat = async (user, message, flags, self, extra) => {
    try {
      const [data] = await getUser(extra.channel);
      const { addSongID, skipSongID, volumeSongID } = await data;

      if (flags.customReward && extra.customRewardId === addSongID) {
        ComfyJS.Say("!sr " + message, extra.channel);
      }

      if (
        user == "StreamElements" &&
        (message.lastIndexOf("to the queue") != -1 ||
          message.lastIndexOf("do kolejki"))
      ) {
        await pauseSong(extra.channel);
        await timeRequest(extra.channel, "add");
      }

      if (flags.customReward && extra.customRewardId === skipSongID) {
        const { isPlayingNow } = songPlayingNow(extra.channel);

        if (isPlayingNow) {
          await ComfyJS.Say("!skip", extra.channel);
          await timeRequest(extra.channel, "skip");
        } else {
          nextSong(extra.channel);
        }
      }

      const { id, min, max, minSR, maxSR, time } = volumeSongID
        ? volumeSongID
        : {
            id: null,
            min: null,
            max: null,
            minSR: null,
            maxSR: null,
            time: null
          };

      if (volumeSongID && flags.customReward && extra.customRewardId === id) {
        ComfyJS.Say("!volume " + maxSR, extra.channel);
        changeVolumeOnTime(extra.channel, min, max, time);

        let now = Date.now();

        if (maxVolumeDate > now) {
          maxVolumeDate += time;
        }

        if (!maxVolumeDate || maxVolumeDate < now) {
          maxVolumeDate = now + time;
        }

        clearTimeout(timeMaxVolume);
        timeMaxVolume = setTimeout(() => {
          ComfyJS.Say("!volume " + minSR, extra.channel);
        }, maxVolumeDate - now);
      }

      if (message == "skip" && user === "DynaM1X1") {
        try {
          const { isPlayingNow } = await songPlayingNow(extra.channel);
          console.log("tu jest, ", isPlayingNow);
          if (isPlayingNow) {
            ComfyJS.Say("!skip", extra.channel);
            await timeRequest(extra.channel, "skip");
          } else {
            nextSong(extra.channel);
          }
        } catch {
          console.log("err");
        }
      }

    } catch(err) {console.log(`Error when use message ${err}`)}

    if (message === "pause" && user === "DynaM1X1") {
     pauseSong(extra.channel);
    }

    if (message === "start" && user === "DynaM1X1") {
      startSong(extra.channel);
    }

    if (message === "device" && user === "DynaM1X1") {
      refreshDevices(extra.channel);
    }
    
    if (message === "www" && user === "DynaM1X1") {
      console.log("aaaa")
      ComfyJS.Say("aaaa", extra.channel);
      //changeVolumeOnTime("dynam1x1",30,50,5000)
    }

    // volume [value] command
    const isVolumeCommand = message.lastIndexOf("volume");
    const volumeValue = message.substr(7);

    if (isVolumeCommand == 0 && (flags.mod || flags.broadcaster)) {
      setVolume(extra.channel, volumeValue);
    }

    // volume [value] command

    const isPriamidka = message.lastIndexOf("piramidka");
    let emote = message.substr(9);
    !emote && (emote = "catJAM ");
    if (
      isPriamidka == 0 &&
      message.length < 30 &&
      (flags.mod || flags.broadcaster)
    ) {
      ComfyJS.Say(emote + " ", extra.channel);
      ComfyJS.Say(emote + " " + emote + " ", extra.channel);
      ComfyJS.Say(emote + " " + emote + " " + emote + " ", extra.channel);
      ComfyJS.Say(
        emote + " " + emote + " " + emote + " " + emote + " ",
        extra.channel
      );
      ComfyJS.Say(emote + " " + emote + " " + emote + " ", extra.channel);
      ComfyJS.Say(emote + " " + emote + " ", extra.channel);
      ComfyJS.Say(emote + " ", extra.channel);
    }

    extra.customRewardId && console.log(extra.customRewardId, extra.channel);

    //WOJTI SPAM NA IMIE

    if (user == "traviscwat" && extra.channel == "simplywojtek") {
      let now = Date.now();

      if (timeCooldownTravis < now) {
        timeCooldownTravis = 5 * 60 * 1000 + now;
        ComfyJS.Say("Travis UPOUPO", extra.channel);
      }
    }

    if (user == "traviscwat" && extra.channel == "l2plelouch") {
      let now = Date.now();

      if (timeCooldownTravis < now) {
        timeCooldownTravis = 5 * 60 * 1000 + now;
        ComfyJS.Say("^ Denciak", extra.channel);
      }
    }

    if (user == "og1ii" && extra.channel == "l2plelouch") {
      let now = Date.now();

      if (timeCooldownOgiii < now) {
        timeCooldownOgiii = 5 * 60 * 1000 + now;
        ComfyJS.Say("^ Dyktator", extra.channel);
      }
    }
  };
};

module.exports = {
  messages
};
