const { runApi,pauseSong,startSong, refreshAccessToken } = require("./spotifyBot");

runApi()

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
const TWITCHCHANNELS = ["kezman22", "simplywojtek", "og1ii"];
const OAUTH = process.env.OAUTH;

const addSongIdList = [
  { name: "kezman22", id: "3d0baf73-3272-4ed5-8b06-dc12ad764dc6" },
  { name: "simplywojtek", id: "11bcc229-5d3f-4a14-aca7-3b00ace01d7a" },
  { name: "og1ii", id: "4834784f-eb24-4559-8c00-ea474897c3e6" }
];

const skipSongIdList = [
  { name: "kezman22", id: "09150d1d4-51fb-4219-a3ff-92398614029c" },
  { name: "simplywojtek", id: "9150d1d4-51fb-4219-a3ff-92398614029c" },
  { name: "og1ii", id: "dc293b9a-8278-401e-aa23-e715e3f6b4bc" }
];

ComfyJS.onChat = (user, message, flags, self, extra) => {
  addSongIdList.forEach(({ id }) => {
    if (flags.customReward && extra.customRewardId === id) {
      ComfyJS.Say("!sr " + message, extra.channel);
    }
  });
  skipSongIdList.forEach(({ id }) => {
    if (flags.customReward && extra.customRewardId === id) {
      ComfyJS.Say("!skip", extra.channel);
    }
  });
  
  
  message === "pause" && pauseSong(extra.channel)
  message === "start" && startSong(extra.channel)
  
  

  message === "srbottest" &&
    (flags.mod || flags.broadcaster) &&
    ComfyJS.Say("Bot works!", extra.channel);

  if (message == "piramidka" && (flags.mod || flags.broadcaster)) {
    ComfyJS.Say("kezmanD", extra.channel);
    ComfyJS.Say("kezmanD kezmanD ", extra.channel);
    ComfyJS.Say("kezmanD kezmanD kezmanD", extra.channel);
    ComfyJS.Say("kezmanD kezmanD kezmanD kezmanD", extra.channel);
    ComfyJS.Say("kezmanD kezmanD kezmanD", extra.channel);
    ComfyJS.Say("kezmanD kezmanD ", extra.channel);
    ComfyJS.Say("kezmanD", extra.channel);
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

// Run the server and report out to the logs
fastify.listen(process.env.PORT, function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});
