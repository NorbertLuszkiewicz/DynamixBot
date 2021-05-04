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

const ComfyJS = require("comfy.js");
const TWITCHUSER = "dynam1x__";
const TWITCHCHANNELS = "kezman22";
const OAUTH = process.env.OAUTH;
const addSongId = "3d0baf73-3272-4ed5-8b06-dc12ad764dc6";
const skipSongId = "0feec3ff-0f07-4e6c-8113-70e1eb6a8dec";

ComfyJS.onChat = (user, message, flags, self, extra) => {
  if (flags.customReward && extra.customRewardId === addSongId) {
    ComfyJS.Say("!sr " + message);
  }

  if (flags.customReward && extra.customRewardId === skipSongId) {
    ComfyJS.Say("!skip");
  }
  message === "srbottest" && ComfyJS.Say("Bot works!");

  extra.customRewardId && console.log(extra.customRewardId);
};

ComfyJS.Init(TWITCHUSER, OAUTH, TWITCHCHANNELS);

console.log(`https://${process.env.PROJECT_DOMAIN}.glitch.me`)
setInterval(() => { fastify.get('/'); }, 280000);

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
