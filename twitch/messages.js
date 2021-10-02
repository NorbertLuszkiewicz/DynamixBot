const {
  nextSong,
  pauseSong,
  startSong,
  refreshDevices,
  changeVolumeOnTime,
  setVolume
} = require("../spotifyBot");

const { songPlayingNow, timeRequest } = require("../streamElements");

const ComfyJS = require("comfy.js");

let maxVolumeDate = 0;
let timeMaxVolume = 0;
let timeCooldownTravis = 0;
let timeCooldownOgiii = 0;

const addSongIdList = [
  { name: "kezman22", id: "3d0baf73-3272-4ed5-8b06-dc12ad764dc6" },
  { name: "simplywojtek", id: "11bcc229-5d3f-4a14-aca7-3b00ace01d7a" },
  { name: "og1ii", id: "4834784f-eb24-4559-8c00-ea474897c3e6" }
];

const skipSongIdList = [
  { name: "kezman22", id: "0feec3ff-0f07-4e6c-8113-70e1eb6a8dec" },
  { name: "simplywojtek", id: "9150d1d4-51fb-4219-a3ff-92398614029c" },
  { name: "og1ii", id: "dc293b9a-8278-401e-aa23-e715e3f6b4bc" }
];

const maxVolumeList = [
  {
    name: "kezman22",
    id: "8700497a-4653-4d41-9c21-4afa31836666",
    max: 100,
    min: 55,
    maxSR: 65,
    minSR: 15,
    time: 45000
  },
  {
    name: "simplywojtek",
    id: "55550d1d4-51fb-4219-a3ff-92398614029c",
    max: 70,
    min: 30,
    maxSR: 65,
    minSR: 15,
    time: 45000
  },
  {
    name: "dynam1x1",
    id: "09150d1d4-51fb-4219-a3ff-92398614029c",
    max: 70,
    min: 35,
    maxSR: 65,
    minSR: 15,
    time: 30000
  },
  {
    name: "og1ii",
    id: "d4449a-8278-401e-aa23-e715e3f6b4bc",
    max: 100,
    min: 69,
    maxSR: 65,
    minSR: 15,
    time: 30000
  }
];

const messages = ()=> (ComfyJS.onChat = (user, message, flags, self, extra) => {
  addSongIdList.forEach(({ id }) => {
    if (flags.customReward && extra.customRewardId === id) {
      ComfyJS.Say("!sr " + message, extra.channel);
    }
  });

  if (user == "StreamElements" && message.lastIndexOf("to the queue") != -1) {
    pauseSong(extra.channel, status => {
      status == "200" && timeRequest(extra.channel, "add");
    });
  }

  skipSongIdList.forEach(({ id }) => {
    if (flags.customReward && extra.customRewardId === id) {
      songPlayingNow(extra.channel, function(songPlaying) {
        if (songPlaying) {
          ComfyJS.Say("!skip", extra.channel);
          timeRequest(extra.channel, "skip");
        } else {
          nextSong(extra.channel);
        }
      });
    }
  });

  maxVolumeList.forEach(({ id, min, max, minSR, maxSR, time }) => {
    if (flags.customReward && extra.customRewardId === id) {
      ComfyJS.Say("!volume " + maxSR, extra.channel);
      changeVolumeOnTime(extra.channel, min, max, time);

      let now = Date.now();
      console.log(now);

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
  });

  if (message === "pause" && user === "DynaM1X1") {
    setVolume(extra.channel, 30);
  }

  if (message === "start" && user === "DynaM1X1") {
    startSong(extra.channel);
  }

  if (message === "device" && user === "DynaM1X1") {
    refreshDevices(extra.channel);
  }

  const isVolumeCommand = message.lastIndexOf("volume");
  const volumeValue = message.substr(7);

  if (isVolumeCommand == 0 && (flags.mod || flags.broadcaster)) {
    setVolume(extra.channel, volumeValue);
  }

  message === "srbottest" &&
    (flags.mod || flags.broadcaster) &&
    ComfyJS.Say("Bot works!", extra.channel);

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
    console.log(timeCooldownTravis, now, timeCooldownTravis < now);
    if (timeCooldownTravis < now) {
      timeCooldownTravis = 10 * 60 * 1000 + now;
      ComfyJS.Say("Travis UPOUPO", extra.channel);
    }
  }

  if (user == "traviscwat" && extra.channel == "l2plelouch") {
    let now = Date.now();
    console.log(timeCooldownTravis, now, timeCooldownTravis < now);
    if (timeCooldownTravis < now) {
      timeCooldownTravis = 3 * 60 * 1000 + now;
      ComfyJS.Say("^ Denciak", extra.channel);
    }
  }

  if (user == "og1ii" && extra.channel == "l2plelouch") {
    let now = Date.now();
    console.log(timeCooldownOgiii, now, timeCooldownOgiii < now);
    if (timeCooldownOgiii < now) {
      timeCooldownOgiii = 3 * 60 * 1000 + now;
      ComfyJS.Say("^ Dyktator", extra.channel);
    }
  }
});

module.exports = {
  messages
};
