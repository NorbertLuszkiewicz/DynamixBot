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

//   collection.insertOne({
//     stremer: "og1ii",
//     addSongID: "4834784f-eb24-4559-8c00-ea474897c3e6",
//     skipSongID: "dc293b9a-8278-401e-aa23-e715e3f6b4bc",
//     refreshToken: "AQCYs0az-dh95MDuWB72JAruSc4rj821ERIEK4RpMsEvsQqp5pyzsaqu9kMbqUKsamCI2_gzqyNDkFEEIXE0pHvVX_3_1c3XjfyT-S2NXYKSPl7Ms3w1ZKxsq9ZInJZiezY",
//     accessToken: "BQBujnjEobElD-6NrVgSYQrHbMzVKy8R8HnYOyZXwZMne-vmupE8wruoSWU58ytwsRtYEZKPpqNQ2ICdlTyC0IzGjJJsYusNyNCDDrmdFutUFn7mSjLIvkNpQyHfhsrx6aT0ysgc7_kDYPPx3A2LOjNsxQDksJG44W-hAb8MnHzkslxBZmmtXfBqZc2UYz1WYCY2txOgB4DVbgbiHphW9a7fAL3fnqRtC-ZrY20Ji_14GqNaEWSB4pmHel3FhD_XvdSY2PNKT3CFcXFDQZJsjQnDbz9Xv-rG",
//     device: "74f023b787b851fef40a8b91620ccc5371ce71bb",
//     clientSongRequestID: "60f4bd84c7bdca5bc32e77c7",
//     clientSongRequestSecret: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiNjBmNGJkODRjN2JkY2ExOTA3MmU3N2M2Iiwicm9sZSI6Im93bmVyIiwiY2hhbm5lbCI6IjYwZjRiZDg0YzdiZGNhNWJjMzJlNzdjNyIsInByb3ZpZGVyIjoidHdpdGNoIiwiYXV0aFRva2VuIjoiRlJ3Znc4YVlSc3BuTGoyWTRXOER1X2MzZk50OE1FVzdQTkptb2VoNFlBV3p4UWppIiwiaWF0IjoxNjI5OTM0NDk4LCJpc3MiOiJTdHJlYW1FbGVtZW50cyJ9.8y0ISUUjFcVZ9qc1b2MVpYX646SR61V1ptnZLhkWwKc",

//   });
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
