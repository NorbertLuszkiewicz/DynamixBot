const {
  addSpotify,
  refreshAccessToken,
  changeVolumeOnTime,
  currentlyPlaying,
  setTimeoutVolume
} = require("./spotify");
const { getUser, updateUser } = require("./controllers/UserController.js");
const { addNewUser, refreshTwitchTokens } = require("./twitch/twitch.js");
const path = require("path");
const { twitchCommands } = require("./twitch/index.js");
twitchCommands();

setTimeoutVolume();
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

// fastify.register(require("fastify-static"), {
//   root: path.join(__dirname, "public"),
//   prefix: "/"
// });

// fastify.register(require("fastify-formbody"));
fastify.register(require("point-of-view"), {
  engine: {
    handlebars: require("handlebars")
  }
});
fastify.register(require("fastify-cors"));

// load and parse SEO data
const seo = require("./src/seo.json");
if (seo.url === "glitch-default") {
  seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}

fastify.get("/", function(req, res) {
  res.redirect(`https://dynamix-bot.pl/`)
});

fastify.get("/spotify", (req, res) => {
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
    }&scope=${encodeURIComponent(
      scopes
    )}&redirect_uri=${`https://dynamix-bot.glitch.me/callback`}&state=${
      req.query.user
    }`
  );
});

fastify.get("/callback", async (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const user = req.query.state;

  try {
    const callback = await addSpotify(user, code);

    callback == "success"
      ? res.redirect(`https://dynamix-bot.pl/dashboard`)
      : res.redirect(
          `https://dynamix-bot.pl/?error${callback ? callback.status : 400}`
        );
  } catch {
    console.log("Error when redirect with spotify data to /dashboard ");
    res.redirect(`https://dynamix-bot.pl/?error${400}`);
  }
});

fastify.get("/register", async (req, res) => {
  const code = req.query.code;

  try {
    const callback = await addNewUser(code);

    callback.status == "success"
      ? res.redirect(
          `https://dynamix-bot.pl/dashboard?name=${callback.name}&token=${callback.token}`
        )
      : res.send("Something went wrong");
  } catch {
    console.log("Error when redirect with twitch data to /dashboard");
  }
});

fastify.get("/account", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");

  const name = req.query.name;
  const token = req.query.token;

  try {
    const [user] = await getUser(name);

    if (user) {
      user.twitchAccessToken === token
        ? res.send(user)
        : res.status(401).send({
            message: "Unauthorized"
          });
    } else {
      res.status(404).send({
        message: "This user dosn't exist"
      });
    }
  } catch {
    console.log("Error when get account");
    res.status(400).send({
      message: "Not Found"
    });
  }
});

fastify.put("/streamelements", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT");

  const clientID = req.body.clientID;
  const token = req.body.token;
  const user = req.body.user;

  try {
    await updateUser({
      streamer: user,
      clientSongRequestID: clientID,
      clientSongRequestSecret: token
    });
  } catch {
    console.log("Error when get account");
    res.status(400).send({
      message: "Something went wrong"
    });
  }
});

fastify.put("/volumeaward", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT");

  const min = req.body.min;
  const max = req.body.max;
  const minSR = req.body.minSR;
  const maxSR = req.body.maxSR;
  const time = req.body.time;
  const user = req.body.user;

  try {
    const [data] = await getUser(user);
    const id = data.volumeSongID ? data.volumeSongID.id : "";

    await updateUser({
      streamer: user,
      volumeSongID: {
        id,
        min,
        max,
        minSR,
        maxSR,
        time
      }
    });
  } catch {
    console.log("Error when get account");
    res.status(400).send({
      message: "Something went wrong"
    });
  }
});

fastify.listen(process.env.PORT, function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening on ${address}`);
});
