const {
  nextSong,
  pauseSong,
  startSong,
  refreshAccessToken,
  refreshDevices,
  changeVolumeOnTime,
  setVolume,
  currentlyPlaying
} = require("./spotifyBot");

const {
  returnSpotify,
  songPlayingNow,
  timeRequest
} = require("./streamElements");

const path = require("path");

// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  logger: true
});

// Setup our static files
fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/" // optional: default '/'
});

// fastify-formbody lets us parse incoming forms
fastify.register(require("fastify-formbody"));

// point-of-view is a templating manager for fastify
fastify.register(require("point-of-view"), {
  engine: {
    handlebars: require("handlebars")
  }
});

// load and parse SEO data
const seo = require("./src/seo.json");
if (seo.url === "glitch-default") {
  seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}

// Our home page route, this pulls from src/pages/index.hbs
fastify.get("/", function(request, reply) {
  // params is an object we'll pass to our handlebars template
  let params = { seo: seo };
  // check and see if someone asked for a random color
  if (request.query.randomize) {
    // we need to load our color data file, pick one at random, and add it to the params
    const colors = require("./src/colors.json");
    const allColors = Object.keys(colors);
    let currentColor = allColors[(allColors.length * Math.random()) << 0];
    params = {
      color: colors[currentColor],
      colorError: null,
      seo: seo
    };
  }
  reply.view("/src/pages/index.hbs", params);
});

//Start Twitch bot

const ComfyJS = require("comfy.js");
const TWITCHUSER = "dynam1x1";
const TWITCHCHANNELS = [
  "kezman22",
  "simplywojteksimplywojtek",
  "og1ii",
  "l2plelouch",
  "dynam1x1"
];
const OAUTH = process.env.OAUTH;
let maxVolumeDate = 0;
let timeMaxVolume = 0;

setTimeout(refreshAccessToken, 5000);
setInterval(refreshAccessToken, 35000);

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
    time: 45000
  },
  {
    name: "simplywojtek",
    id: "9150d1d4-51fb-4219-a3ff-92398614029c",
    max: 100,
    min: 75,
    time: 30000
  },
  {
    name: "dynam1x1",
    id: "09150d1d4-51fb-4219-a3ff-92398614029c",
    max: 70,
    min: 35,
    time: 30000
  },
  {
    name: "og1ii",
    id: "dc293b9a-8278-401e-aa23-e715e3f6b4bc",
    max: 100,
    min: 69,
    time: 30000
  }
];

ComfyJS.onChat = (user, message, flags, self, extra) => {
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

  maxVolumeList.forEach(({ id, min, max, time }) => {
    if (flags.customReward && extra.customRewardId === id) {
      ComfyJS.Say("!volume " + max, extra.channel);
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
        ComfyJS.Say("!volume " + min, extra.channel);
      }, maxVolumeDate - now);
    }
  });

  if (message === "pause" && user === "DynaM1X1") {
    pauseSong(extra.channel, status => {
      status == "200" && timeRequest(extra.channel, "skip");
    });
  }

  if (message === "start" && user === "DynaM1X1") {
    ComfyJS.Say(
      "!sr https://www.youtube.com/watch?v=T3zsoUwyqnU&ab_channel=LANCA",
      extra.channel
    );
    pauseSong(extra.channel, status => {
      status == "200" && timeRequest(extra.channel, "add");
    });
  }

  if (message === "device" && user === "DynaM1X1") {
    refreshDevices(extra.channel);
  }

  if (message === "volumetest" && user === "DynaM1X1") {
    let { id, min, max, time } = maxVolumeList[2];
    ComfyJS.Say("!volume " + max, extra.channel);
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
      ComfyJS.Say("!volume " + min, extra.channel);
    }, maxVolumeDate - now);
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
};

ComfyJS.onCommand = (user, command, message, flags, extra) => {
  if (command == "song") {
    currentlyPlaying(extra.channel, data => {
      console.log(data);
      songPlayingNow(extra.channel, function(songPlaying, title, url) {
        if (songPlaying) {
          ComfyJS.Say("@" + user + " " + title + " " + url, extra.channel);
        } else {
          let url = data.item.external_urls.spotify
            ? data.item.external_urls.spotify
            : "";
          let name = data.item.name ? data.item.name : "nieznane";

          data &&
            ComfyJS.Say("@" + user + " " + name + " " + url, extra.channel);
        }
      });
    });
  }

  if (command == "playlist" || command == "playlista") {
    currentlyPlaying(extra.channel, data => {
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
    songPlayingNow(extra.channel, function(songPlaying) {
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
  ComfyJS.Say("gratuluje suba " + recipientUser, extra.channel);
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
  ComfyJS.Say("/chant @" + user + " dzięki za suba peepoLove ", extra.channel);
};

ComfyJS.onSub = (user, message, subTierInfo, extra) => {
  ComfyJS.Say("/chant @" + user + " dzięki za suba peepoLove ", extra.channel);
};

ComfyJS.Init(TWITCHUSER, OAUTH, TWITCHCHANNELS);

//End Twitch bot

console.log(`https://${process.env.PROJECT_DOMAIN}.glitch.me`);

// A POST route to handle and react to form submissions
fastify.post("/", function(request, reply) {
  let params = { seo: seo };
  // the request.body.color is posted with a form submission
  let color = request.body.color;
  // if it's not empty, let's try to find the color
  if (color) {
    // load our color data file
    const colors = require("./src/colors.json");
    // take our form submission, remove whitespace, and convert to lowercase
    color = color.toLowerCase().replace(/\s/g, "");
    // now we see if that color is a key in our colors object
    if (colors[color]) {
      // found one!
      params = {
        color: colors[color],
        colorError: null,
        seo: seo
      };
    } else {
      // try again.
      params = {
        colorError: request.body.color,
        seo: seo
      };
    }
  }
  reply.view("/src/pages/index.hbs", params);
});

var SpotifyWebApi = require("spotify-web-api-node");
const express = require("express");

// This file is copied from: https://github.com/thelinmichael/spotify-web-api-node/blob/master/examples/tutorial/00-get-access-token.js

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
  "user-follow-modify"
];
// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: "https://dynamix-bot.glitch.me/callback"
});

const app = express();

fastify.get("/login", (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

fastify.get("/callback", (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const state = req.query.state;

  if (error) {
    console.error("Callback Error:", error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {
      const access_token = data.body["access_token"];
      const refresh_token = data.body["refresh_token"];
      const expires_in = data.body["expires_in"];

      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);

      console.log("access_token:", access_token);
      console.log("refresh_token:", refresh_token);

      console.log(
        `Sucessfully retreived access token. Expires in ${expires_in} s.`
      );
      res.send("Success! You can now close the window.");

      setInterval(async () => {
        const data = await spotifyApi.refreshAccessToken();
        const access_token = data.body["access_token"];

        console.log("The access token has been refreshed!");
        console.log("access_token:", access_token);
        spotifyApi.setAccessToken(access_token);
      }, (expires_in / 2) * 1000);
    })
    .catch(error => {
      console.error("Error getting Tokens:", error);
      res.send(`Error getting Tokens: ${error}`);
    });
});

// Run the server and report out to the logs
fastify.listen(process.env.PORT, function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});
