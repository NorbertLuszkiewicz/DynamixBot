const { addNewUser, refreshAccessToken } = require("./spotify");
const path = require("path");
const { twitchCommends } = require("./twitch/index.js");
twitchCommends();

setTimeout(refreshAccessToken, 5000);
setInterval(refreshAccessToken, 1800 * 1000);

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

  collection.insertOne({
    stremer: "kezman22",
    addSongID: "3d0baf73-3272-4ed5-8b06-dc12ad764dc6",
    skipSongID: "0feec3ff-0f07-4e6c-8113-70e1eb6a8dec",
    refreshToken: "AQARUA5cDjZDt0Bv-5ZOPVOj9u3i_Mio7XvW61jBLGCMOKl5x1xFw_gqieiIN5P5kSsWMkqCEmXm4uMmCRk8QsujTEhjRhYx5NuyvgikcTc6C47j12dp-BRxYAEPSOZ4l3g",
    accessToken: "BQBCwAtXVoIC_MmGrKGVtOBXWELImybf_lmm2W9Ccj8u6YCOCQSAX7jt9kVfWg1LztAApu9a6JKgBA7W4TqnytEeSDvIzWBbTOsFus-w9XHYnJvuzf_b7IGu8b0Ss2NZbzIY8VSaZYLEFF08X6kjCrGF5imyjDhimCNauJipt1T3ZBYc4GCOeXorqbKct4OGXWZRSeJxZfR-CkkACFvJeWxJ02jAVMKxCLKOg9I9pDzSkNPrTZpCWN0SYOlK2rRPVRjRx07UdhUfEZo7KvF9_mArzIvD",
    device: "74f023b787b851fef40a8b91620ccc5371ce71bb",
    clientSongRequestID: "59c00fd7374e871d019253fd",
    clientSongRequestSecret: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
    volumeSongID: {
      id: "8700497a-4653-4d41-9c21-4afa31836666",
      max: 100,
      min: 55,
      maxSR: 65,
      minSR: 15,
      time: 45000
    }
  });
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

fastify.get("/callback", (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const params = { seo: seo, auth: "auth" };

  if (error) {
    console.log("Callback Error:", error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  addNewUser(code, callback => {
    callback == "success"
      ? res.view("/src/pages/index.hbs", params)
      : res.send("Something went wrong");
  });
});

fastify.listen(process.env.PORT, function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});
