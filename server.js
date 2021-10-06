const {
  addSpotify,
  refreshAccessToken,
  changeVolumeOnTime,
  currentlyPlaying
} = require("./spotify");
const { getUser } = require("./controllers/UserController.js");
const { addNewUser, refreshTwitchTokens } = require("./twitch/twitch.js");
const path = require("path");
const { twitchCommands } = require("./twitch/index.js");
twitchCommands();

setTimeout(refreshAccessToken, 1000);
setInterval(refreshAccessToken, 1800 * 1000);
setTimeout(refreshTwitchTokens, 1000);
setInterval(refreshTwitchTokens, 10000 * 1000);

const { MongoClient } = require("mongodb");

addSpotify("dynam1x1","AQBqxWUUBknVh5YqD1aWSnDrR23pjnRi3lyIMaqIxaXB44ndpKZb3SGmr8hv6MjrHZt6pV5Xst5VJ7Lp9fj2UVINz9PAHvTv6-hSK9WH-_nUxOKJciMaOTKwP_BogalHEwqYySLjrMMR-CSXz8VZwltxx19wb-z0A29APjr63h0TiqYM3OTmGnLaOXwpca8vShRpd5ZP2Ga4lgCGQMlm6y6WXjf1ipdSA4TSZ8Pv5KBXIkHNar4DICrJdmtelTxH5gz18IfL3MjwrW_Y0dAUNdsHDslSb-_THHQeXISjBssqy4IPOjqOjIEBMi896e3jDL9WHCRw_4XcHrsvm2YD_fUzt8MkFakGhxmQWeLy0mluWYjbV9kK6bi2UjpFak-9rObPFJu1K5Wvfz3wJmxmQ2kbpYqueD9jbwAEKI7wHOyjFnbbKQU20qJJasrXmzjJtQa5hotqgnle4o6guRp8dq5uVfb1F2FDu6_G1pLq6Pt6jagK2kWktRsDj6KR6iNxOYfUk8KsRBJ-Pc8KQUxiLTEtLMzooK2fWMktAFrPnwqbZFUJfz5W5WdOd5xJJBhtFPzt0OFoPjgx6SzjHarEmyU8KSnZgS2fMEY2iSTkgt7E1fAZbU4oAWrBOv3aFN42tXcRqdDk6Ajjmbs6ixAh_mG3rDZZ3iak5SS_a4hGTCluW6lbpioQDGAoq9owDvXQ8YxnaadGUx9DpMIhfgNi2MiBkAHPSTWDVoLZdw")

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
    }&scope=${encodeURIComponent(scopes)}&redirect_uri=${
      `https://dynamix-bot.glitch.me/callback`
    }&state=${req.query.user}`
  );
});

fastify.get("/callback", async (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const user = req.query.state;
  
  console.log(req.query)

  try {
    const callback = await addSpotify(user, code);
    
    console.log(callback, "callback")
    callback == "success" ?
      res.redirect(
          `http://localhost:3000/dashboard`
        ) :
      res.redirect(
          `http://localhost:3000/dashboard?error${callback ? callback.status : 400}`
        )

  } catch (err){
    console.log("Error when redirect with spotify data to /dashboard "+ err+ error)
    res.redirect(
          `http://localhost:3000/dashboard`
        )
  }
});

fastify.get("/register", async (req, res) => {
  const code = req.query.code;

  try {
    const callback = await addNewUser(code);
    
    console.log(callback)

    callback.status == "success"
      ? res.redirect(
          `http://localhost:3000/dashboard?name=${callback.name}&token=${callback.token}`
        )
      : res.send("Something went wrong");
  } catch {
    console.log("Error when redirect with twitch data to /dashboard")
  }
});

fastify.get("/account", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST");

  const name = req.query.name;
  const token = req.query.token;

  try {
    const [user] = await getUser(name);

    if (user) {
      user.twitchAccessToken === token
        ? res.send(user)
        : res.status(403).send({
            message: "Unauthorization"
          });
    } else {
      res.status(400).send({
        message: "This user dosn't exist"
      });
    }
  } catch {
     console.log("Error when get account");
    res.status(404).send({
        message: "Not Found"
      });
   
  }
});

fastify.listen(process.env.PORT, function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});
