const fastify = require("fastify")({ logger: true });
const path = require("path");
const {
  addSpotify,
  refreshAccessToken,
  changeVolumeOnTime,
  currentlyPlaying,
  setTimeoutVolume,
} = require("../spotify");
const { getUser, updateUser } = require("../controllers/UserController.js");
const { addNewUser, refreshTwitchTokens } = require("../twitch/twitch.js");
const { addTftUser } = require("../riot/riot.js");

async function routes(fastify, options) {
  fastify.get("/", function (req, res) {
    res.send("");
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
      "user-follow-modify",
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
      fastify.log.error("Error when redirect with spotify data");
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
      fastify.log.error("Error when redirect with twitch data");
    }
  });

  fastify.get("/account", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "https://dynamix-bot.pl");
    res.header("Access-Control-Allow-Methods", "GET");

    const name = req.query.name;
    const token = req.query.token;

    try {
      const [user] = await getUser(name);

      if (user) {
        user.twitchAccessToken === token
          ? res.send(user)
          : res.status(401).send({
              message: "Unauthorized",
            });
      } else {
        res.status(404).send({
          message: "This user dosn't exist",
        });
      }
    } catch {
      fastify.log.error("Error when get account");
      res.status(400).send({
        message: "Not Found",
      });
    }
  });

  fastify.put("/streamelements", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "https://dynamix-bot.pl");
    res.header("Access-Control-Allow-Methods", "PUT");

    const clientID = req.body.clientID;
    const token = req.body.token;
    const user = req.body.user;

    try {
      await updateUser({
        streamer: user,
        clientSongRequestID: clientID,
        clientSongRequestSecret: token,
      });
    } catch {
      fastify.log.error("Error when get account");
      res.status(400).send({
        message: "Something went wrong",
      });
    }
  });

  fastify.put("/volumeaward", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "https://dynamix-bot.pl");
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
          time,
        },
      });
    } catch {
      fastify.log.error("Error when get account");
      res.status(400).send({
        message: "Something went wrong",
      });
    }
  });

  fastify.put("/riot", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "https://dynamix-bot.pl");
    res.header("Access-Control-Allow-Methods", "PUT");

    const name = req.body.name;
    const server = req.body.server;
    const user = req.body.user;

    try {
      addTftUser(name, server, user);
    } catch {
      fastify.log.error("Error when add riot account");
      res.status(400).send({
        message: "Something went wrong",
      });
    }
  });
  fastify.put("/slots", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "https://dynamix-bot.pl");
    res.header("Access-Control-Allow-Methods", "PUT");

    const { name, emotes, withBan, user } = req.body;

    const newSlots = { name, id: null, withBan, emotes: emotes.parseInt(), times: 0, wins: 0 };

    try {
      const [data] = await getUser(user);

      if (data.slotsID && data.slotsID.length > 0) {
        await updateUser({
          streamer: user,
          slotsID: [...data.slotsID, newSlots],
        });
      } else {
        await updateUser({
          streamer: user,
          slotsID: [newSlots],
        });
      }
    } catch (err) {
      fastify.log.error("Error when add slots award");
      res.status(400).send({
        message: "Something went wrong",
      });
    }
  });
}

module.exports = routes;
