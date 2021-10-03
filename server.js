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
    stremer: "dynam1x1",
    refreshToken: "AQDZ1nmBW5nL_uy1Xlp8-hP2aikNfvIeZ61WcF_rTd6LcpRx82hjR5CzDPRoiIEjREPugOBT8eDPLLVOX1Y65QP05xBRt_Dwc0TosNGb1ZUiREL_a4j95WaI_5OiB6GuDWc",
    accessToken: "BQCn8j4JkYaxVUK_bIft2NYhBjM_EkOUIHqKKyrM_cztAV61GDtwBp879QnFvxrkkFEHY038wgpXqAGsGJa24asCFSMA80c8zN3DmR1mCvWg2FrV4W-m_ZqUWoZ8URWpsk0PBspVFWMhHDHN-rnO_OvgcRzGMrVjW1Z54EPZU3AGDbHRV5JV1p8THp01vWnjsWyVAhRWWA2-4nkUJA2cL5mWvW9kNzaVmkewejio7VnoxNkwxBeH8jjVahtSRV2yeOve8JuqIZdhBYw3fnLXVLp9R6SU_miosfM",
    device: "c3e9e9038e921489b7106d098ca11128b330ae36",
    clientSongRequestID: "5bb10e2363a6df5e9a3ddddd",
    clientSongRequestSecret: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
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
