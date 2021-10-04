const {
  nextSong,
  pauseSong,
  startSong,
  refreshAccessToken,
  refreshDevices,
  changeVolumeOnTime,
  setVolume,
  currentlyPlaying,
  addNewUser,
} = require("./spotifyBot");

const {
  songPlayingNow,
  timeRequest,
} = require("./streamElements");

const path = require("path");

const fastify = require("fastify")({
  logger: true,
});

fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

fastify.register(require("fastify-formbody"));

fastify.register(require("point-of-view"), {
  engine: {
    handlebars: require("handlebars"),
  },
});

// load and parse SEO data
const seo = require("./src/seo.json");
if (seo.url === "glitch-default") {
  seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}

fastify.get("/", function (request, reply) {
  let params = { seo: seo, auth: "display-none" };

  reply.view("/src/pages/index.hbs", params);
});

//Start Twitch bot

const ComfyJS = require("comfy.js");
const TWITCHUSER = "dynam1x1";
const TWITCHCHANNELS = [
  "kezman22",
  "simplywojtek",
  "og1ii",
  "l2plelouch",
  "dynam1x1",
];
const OAUTH = process.env.OAUTH;
let maxVolumeDate = 0;
let timeMaxVolume = 0;
let timeCooldownTravis = 0;
let timeCooldownOgiii = 0;

setTimeout(refreshAccessToken, 5000);
setInterval(refreshAccessToken, 1800 * 1000);

const addSongIdList = [
  { name: "kezman22", id: "3d0baf73-3272-4ed5-8b06-dc12ad764dc6" },
  { name: "simplywojtek", id: "11bcc229-5d3f-4a14-aca7-3b00ace01d7a" },
  { name: "og1ii", id: "4834784f-eb24-4559-8c00-ea474897c3e6" },
];

const skipSongIdList = [
  { name: "kezman22", id: "0feec3ff-0f07-4e6c-8113-70e1eb6a8dec" },
  { name: "simplywojtek", id: "9150d1d4-51fb-4219-a3ff-92398614029c" },
  { name: "og1ii", id: "dc293b9a-8278-401e-aa23-e715e3f6b4bc" },
];

const maxVolumeList = [
  {
    name: "kezman22",
    id: "8700497a-4653-4d41-9c21-4afa31836666",
    max: 100,
    min: 55,
    maxSR: 65,
    minSR: 15,
    time: 45000,
  },
  {
    name: "simplywojtek",
    id: "55550d1d4-51fb-4219-a3ff-92398614029c",
    max: 70,
    min: 30,
    maxSR: 65,
    minSR: 15,
    time: 45000,
  },
  {
    name: "dynam1x1",
    id: "09150d1d4-51fb-4219-a3ff-92398614029c",
    max: 70,
    min: 35,
    maxSR: 65,
    minSR: 15,
    time: 30000,
  },
  {
    name: "og1ii",
    id: "d4449a-8278-401e-aa23-e715e3f6b4bc",
    max: 100,
    min: 69,
    maxSR: 65,
    minSR: 15,
    time: 30000,
  },
];

ComfyJS.onChat = (user, message, flags, self, extra) => {
  addSongIdList.forEach(({ id }) => {
    if (flags.customReward && extra.customRewardId === id) {
      ComfyJS.Say("!sr " + message, extra.channel);
    }
  });

  if (user == "StreamElements" && message.lastIndexOf("to the queue") != -1) {
    pauseSong(extra.channel)
    timeRequest(extra.channel, "add");
  
  }

  skipSongIdList.forEach(({ id }) => {
    if (flags.customReward && extra.customRewardId === id) {
      songPlayingNow(extra.channel, function (songPlaying) {
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
    console.log(volumeValue, "tyle daje");
    setVolume(extra.channel, volumeValue);
  }

  message === "srbottest" &&
    (flags.mod || flags.broadcaster) &&
    ComfyJS.Say("Bot works!", extra.channel);

  if (message == "piramidka" && (flags.mod || flags.broadcaster)) {
    ComfyJS.Say("kezmanJAM ", extra.channel);
    ComfyJS.Say("kezmanJAM  kezmanJAM  ", extra.channel);
    ComfyJS.Say("kezmanJAM  kezmanJAM  kezmanJAM ", extra.channel);
    ComfyJS.Say("kezmanJAM  kezmanJAM  kezmanJAM  kezmanJAM ", extra.channel);
    ComfyJS.Say("kezmanJAM  kezmanJAM  kezmanJAM ", extra.channel);
    ComfyJS.Say("kezmanJAM  kezmanJAM  ", extra.channel);
    ComfyJS.Say("kezmanJAM ", extra.channel);
  }
  const isPriamidka = message.lastIndexOf("piramidka");
  const emote = message.substr(9);

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
};

//KOMENDY

ComfyJS.onCommand = (user, command, message, flags, extra) => {
  if (command == "song") {
    currentlyPlaying(extra.channel, (data) => {
      console.log(data, "komenda !song");
      songPlayingNow(extra.channel, function (songPlaying, title, url) {
        console.log(songPlaying, "songPlaying");
        if (songPlaying) {
          ComfyJS.Say("@" + user + " " + title + " " + url, extra.channel);
        } else {
          let url = data.item.external_urls.spotify
            ? data.item.external_urls.spotify
            : "";
          let title = data.item.name ? data.item.name : "nieznane";
          let autor = "";
          if (data.item.artists.length < 4 && data.item.artists.length > 0) {
            data.item.artists.forEach((artist) => {
              autor += artist.name + ", ";
            });
          }

          data &&
            ComfyJS.Say(
              "@" + user + " " + title + " | " + autor + " " + url,
              extra.channel
            );
        }
      });
    });
  }

  if (command == "playlist" || command == "playlista") {
    currentlyPlaying(extra.channel, (data) => {
      let url = data.context.external_urls.spotify
        ? data.context.external_urls.spotify
        : "nieznane";

      data &&
        ComfyJS.Say(
          "@" + user + " aktualnie leci ta playlista: " + url + " catJAM ",
          extra.channel
        );
    });
  }

  if (command == "next" && (user === "DynaM1X1" || flags.broadcaster)) {
    songPlayingNow(extra.channel, function (songPlaying) {
      console.log(songPlaying, "songPlaying");
      if (songPlaying) {
        ComfyJS.Say("!skip", extra.channel);
        timeRequest(extra.channel, "skip");
      } else {
        nextSong(extra.channel);
      }
    });
  }
};

//Chant

ComfyJS.onRaid = (user, viewers, extra) => {
  viewers > 10 &&
    ComfyJS.Say(
      "/chant @" + user + "dzięki za raida peepoLove ",
      extra.channel
    );
};

ComfyJS.onHosted = (user, viewers, autohost, extra) => {
  ComfyJS.Say("/chant @" + user + "dzięki za hosta peepoLove ", extra.channel);
};

ComfyJS.onSubGift = (
  gifterUser,
  streakMonths,
  recipientUser,
  senderCount,
  subTierInfo,
  extra
) => {
  if (extra.channel == "og1ii") {
    ComfyJS.Say("og1iiBusiness Yoink", extra.channel);
  } else {
    ComfyJS.Say("gratuluje suba " + recipientUser, extra.channel);
  }

  ComfyJS.Say(
    "/chant @" + gifterUser + " dzięki za gifta peepoLove ",
    extra.channel
  );
};

ComfyJS.onResub = (
  user,
  message,
  streamMonths,
  cumulativeMonths,
  subTierInfo,
  extra
) => {
  if (extra.channel == "og1ii") {
    ComfyJS.Say("og1iiBusiness Yoink", extra.channel);
  } else {
    ComfyJS.Say(user + " VisLaud", extra.channel);
  }

  ComfyJS.Say("/chant @" + user + " dzięki za suba peepoLove ", extra.channel);
};

ComfyJS.onSub = (user, message, subTierInfo, extra) => {
  if (extra.channel == "og1ii") {
    ComfyJS.Say("og1iiBusiness Yoink", extra.channel);
  } else {
    ComfyJS.Say(user + " VisLaud", extra.channel);
  }

  ComfyJS.Say("/chant @" + user + " dzięki za suba peepoLove ", extra.channel);
};

ComfyJS.Init(TWITCHUSER, OAUTH, TWITCHCHANNELS);

//End Twitch bot

console.log(`https://${process.env.PROJECT_DOMAIN}.glitch.me`);


fastify.post("/", function (request, reply) {
  let params = { seo: seo, auth: "display-none" };

  reply.view("/src/pages/index.hbs", params);
});

fastify.get("/login", (req, res) => {
  const scopes = [
    "ugc-image-upload",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "streaming",
    "app-remote-control",
    "user-read-email",
    "user-read-private",
    "playlist-read-collaborative",
    "playlist-modify-public",
    "playlist-read-private",
    "playlist-modify-private",
    "user-library-modify",
    "user-library-read",
    "user-top-read",
    "user-read-playback-position",
    "user-read-recently-played",
    "user-follow-read",
    "user-follow-modify",
  ];

  res.redirect(
    `https://accounts.spotify.com/authorize?response_type=code&client_id=${
      process.env.CLIENT_ID
    }&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(
      "https://dynamix-bot.glitch.me/callback"
    )}`
  );
});

fastify.get("/callback", (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const params = { seo: seo, auth: "auth" };

  if (error) {
    console.error("Callback Error:", error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  addNewUser(code, (callback) => {
    callback == "success"
      ? res.view("/src/pages/index.hbs", params)
      : res.send("Something went wrong");
  });
});

fastify.listen(process.env.PORT, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});
