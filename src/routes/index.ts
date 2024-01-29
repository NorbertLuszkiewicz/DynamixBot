import express from "express";
const router = express.Router();
import {
  addSpotify,
  refreshAccessToken,
  changeVolumeOnTime,
  currentlyPlaying,
  setTimeoutVolume,
} from "../apis/spotify";
import { getUser, updateUser } from "../controllers/UserController";
import { addNewUser, refreshTwitchTokens } from "../apis/twitch/events/twitch";
import { addTftUser, removeTftUser } from "../apis/riot";
import { sendMessage } from "../apis/twitch/events/helix";

router.get("/spotify", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");
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
    }&scope=${encodeURIComponent(scopes.join())}&redirect_uri=${`https://dynamix-bot.glitch.me/callback`}&state=${
      req.query.user
    }`
  );
});

router.get("/callback", async (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const user = req.query.state;

  try {
    const callback = await addSpotify(user, code);

    callback == "success"
      ? res.redirect(`https://dynamixbot.pl/dashboard`)
      : res.redirect(`https://dynamixbot.pl/?error${callback ? callback.status : 400}`);
  } catch {
    res.redirect(`https://dynamixbot.pl/?error${400}`);
  }
});

router.get("/", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");
  res.send("work");
});

router.get("/register", async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  const redirectUrl =
    state === "c3ab8aa609ea11e793ae92361f002671" ? "https://dynamixbot.pl/" : "http://localhost:4200/";

  try {
    const callback = await addNewUser(code);

    callback.status === "success"
      ? res.redirect(`${redirectUrl}information?name=${callback.name}&token=${callback.token}`)
      : res.send("Something went wrong");
  } catch {
    console.log("Error when redirect with twitch data");
  }
});

router.get("/account", async (req, res) => {
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
            message: "Unauthorized",
          });
    } else {
      res.status(404).send({
        message: "This user dosn't exist",
      });
    }
  } catch {
    console.log("Error when get account");
    res.status(400).send({
      message: "Not Found",
    });
  }
});

router.put("/streamelements", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://dynamixbot.pl");
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

    res.status(200).send({
      message: "Successfully saved changes",
    });
  } catch {
    console.log("Error when get account");
    res.status(400).send({
      message: "Something went wrong",
    });
  }
});

router.post("/sendmessage", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST");
  const body = JSON.parse(req.body);

  try {
    sendMessage(body.message, body.streamer);
    if (body.addwinner) {
      const [user] = await getUser(body.streamer);
      user.wheelwinners.length === 5 && user.wheelwinners.pop();
      user.wheelwinners ? user.wheelwinners.unshift(body.message) : (user.wheelwinners = [body.message]);
      await updateUser({
        streamer: body.streamer,
        wheelwinners: user.wheelwinners,
      });
    }

    res.status(200).send({
      message: "Successfully send message",
    });
  } catch {
    console.log("Error when send message");
    res.status(400).send({
      message: "Something went wrong",
    });
  }
});

router.put("/volumeaward", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://dynamixbot.pl");
  res.header("Access-Control-Allow-Methods", "PUT");

  const min = req.body.min;
  const max = req.body.max;
  const minSR = req.body.minSR;
  const maxSR = req.body.maxSR;
  const time = req.body.time;
  const user = req.body.user;

  console.log(req.body);

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

    res.status(200).send({
      message: "Successfully saved changes",
    });
  } catch {
    console.log("Error when get account");
    res.status(400).send({
      message: "Something went wrong",
    });
  }
});

router.put("/riot", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://dynamixbot.pl");
  res.header("Access-Control-Allow-Methods", "PUT");

  const name = req.body.name;
  const server = req.body.server;
  const user = req.body.user;

  try {
    addTftUser(name, server, user);
    res.status(200).send({
      message: "Successfully saved changes",
    });
  } catch {
    console.log("Error when add riot account");
    res.status(400).send({
      message: "Something went wrong",
    });
  }
});

router.put("/riot-remove", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://dynamixbot.pl");
  res.header("Access-Control-Allow-Methods", "PUT");

  const name = req.body.name;
  const server = req.body.server;
  const user = req.body.user;

  try {
    removeTftUser(name, server, user);
    res.status(200).send({
      message: "Successfully saved changes",
    });
  } catch {
    console.log("Error when add riot account");
    res.status(400).send({
      message: "Something went wrong",
    });
  }
});

router.put("/slots", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://dynamixbot.pl");
  res.header("Access-Control-Allow-Methods", "PUT");

  const { name, emotes, withBan, user } = req.body;
  const newSlots = {
    name,
    id: null,
    withBan,
    emotes: parseInt(emotes),
    times: 0,
    wins: 0,
  };
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

    res.status(200).send({
      message: "Successfully saved changes",
    });
  } catch (err) {
    console.log("Error when add slots award");
    res.status(400).send({
      message: "Something went wrong",
    });
  }
});

router.put("/command_switch", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://dynamixbot.pl");
  res.header("Access-Control-Allow-Methods", "PUT");

  const { user, body } = req.body;

  try {
    const [data] = await getUser(user);

    await updateUser({
      streamer: user,
      commandSwitch: body,
    });

    res.status(200).send({
      message: "Successfully saved changes",
    });
  } catch (err) {
    console.log("Error when change command switch award");
    res.status(400).send({
      message: "Something went wrong",
    });
  }
});

router.put("/slot_remove", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://dynamixbot.pl");
  res.header("Access-Control-Allow-Methods", "PUT");

  const { id, user } = req.body;

  try {
    const [data] = await getUser(user);

    const newSlotsList = data.slotsID.filter(slot => {
      return slot.name !== id;
    });

    await updateUser({
      streamer: user,
      slotsID: newSlotsList,
    });

    res.status(200).send({
      message: "Successfully saved changes",
    });
  } catch (err) {
    console.log("Error when delete slot");
    res.status(400).send({
      message: "Something went wrong",
    });
  }
});

export default router;
