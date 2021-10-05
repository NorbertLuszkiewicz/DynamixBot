const {
  addSpotify,
  refreshAccessToken,
  changeVolumeOnTime,
  currentlyPlaying
} = require("./spotify");
const { getUser } = require("./controllers/UserController.js");
const { addNewUser, refreshTwitchTokens } = require("./twitch/twitch.js");
const path = require("path");
const { twitchCommends } = require("./twitch/index.js");
twitchCommends();

setTimeout(refreshAccessToken, 1000);
setInterval(refreshAccessToken, 1800 * 1000);
setTimeout(refreshTwitchTokens, 1000);
setInterval(refreshTwitchTokens, 10000 * 1000);

const { MongoClient } = require("mongodb");

const client = new MongoClient(
  `mongodb+srv://${process.env.MONGODB}&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

client.connect(err => {
  err
    ? console.log("Error with connect to database")
    : console.log("Database connected!");

  const collection = client.db("streamers").collection("users");
});

const fastify = require("fastify")({
  logger: true
});

fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/"
});

fastify.register(require("fastify-formbody"));
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

fastify.get("/", function(request, reply) {
  let params = { seo: seo, auth: "display-none" };

  reply.view("/src/pages/index.hbs", params);
});

fastify.post("/", function(request, reply) {
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
    "user-follow-modify"
  ];

  res.redirect(
    `https://accounts.spotify.com/authorize?response_type=code&client_id=${
      process.env.CLIENT_ID
    }&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(
      "https://dynamix-bot.glitch.me/callback"
    )}`
  );
});

fastify.get("/callback", async (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const params = { seo: seo, auth: "auth" };

  if (error) {
    console.log("Callback Error:", error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  try {
    const callback = await addSpotify("streamer", code);
    callback == "success"
      ? res.view("/src/pages/index.hbs", params)
      : res.send("Something went wrong");
  } catch {}
});

fastify.get("/register", async (req, res) => {
  const code = req.query.code;

  try {
    const callback = await addNewUser(code);

    callback.status == "success"
      ? res.redirect(
          `http://localhost:3000/dashboard?name=${callback.name}&token=${callback.token}`
        )
      : res.send("Something went wrong");
  } catch {}
});

fastify.get("/account", async (req, res) => {
  const name = req.query.name;
  const token = req.query.token;
  console.log(name, token);

  try {
    const [user] = await getUser(name);
    console.log(user);

    if (user) {
      user.twitchAccessToken === token ? res.send({data:user}) :
      res.status(403).send({
        message: "Unauthorization"
      });
      
    } else {
      res.status(400).send({
        message: "This user dosn't exist"
      });
    }
  } catch {
    console.log("Error when get account");
  }
});

fastify.listen(process.env.PORT, function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});
