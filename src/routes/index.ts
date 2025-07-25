import express from "express";
import crypto from "crypto";
import bodyParser from "body-parser";
const router = express.Router();
import { addSpotify } from "../apis/spotify";
import { getCredentials, updateCredentials } from "../controllers/CredentialsController";
import { addNewUser } from "../apis/twitch/events/twitch";
import { addTftUser, removeTftUser } from "../apis/riot/tft";
import { sendMessage, timeout } from "../apis/twitch/events/helix";
import { getCommand, updateCommand } from "../controllers/CommandController";
import { getSong, updateSong } from "../controllers/SongController";
import { getRiot } from "../controllers/RiotController";
import { addKickAccess } from "../apis/twitch/events/kick";

router.get("/spotify", (req, res): void => {
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
    }&scope=${encodeURIComponent(scopes.join())}&redirect_uri=${process.env.BE_URL + `callback`}&state=${
      req.query.user
    }`
  );
});

router.get("/callback", async (req, res): Promise<void> => {
  const code = req.query.code;
  const user = req.query.state;

  try {
    const callback = await addSpotify(user, code);

    callback.status === "success"
      ? res.redirect(`${process.env.FE_URL}dashboard`)
      : res.redirect(`${process.env.FE_URL}?error${callback ? callback.status : 400}`);
  } catch {
    res.redirect(`${process.env.FE_URL}?error${400}`);
  }
});

router.get("/", async (req, res): Promise<void> => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");
  res.send("work");
});

router.get("/register", async (req, res): Promise<void> => {
  const code = req.query.code;
  const state = req.query.state;
  const redirectUrl = state === "c3ab8aa609ea11e793ae92361f002671" ? process.env.FE_URL : "http://localhost:4200/";

  try {
    const callback = await addNewUser(code);

    callback.status === "success"
      ? res.redirect(`${redirectUrl}information?name=${callback.name}&token=${callback.token}`)
      : res.send("Something went wrong");
  } catch {
    console.log("Error when redirect with twitch data");
  }
});

router.get("/kickRedirect", async (req, res): Promise<void> => {
  const code = req.query.code;
  const state = req.query.state;

  const stateToString = state as string;
  const isLocal = stateToString.startsWith("local");
  const nick = isLocal ? stateToString.slice("local".length) : stateToString;
  const redirectUrl = isLocal ? "http://localhost:4200/" : process.env.FE_URL;

  try {
    const callback = await addKickAccess(code, nick);

    callback.status === "success" ? res.redirect(`${redirectUrl}information`) : res.send("Something went wrong");
  } catch {
    console.log("Error when redirect with kick data");
  }
});

router.get("/account", async (req, res): Promise<void> => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");

  const name = req.query.name.toString();
  const token = req.query.token;
  try {
    const [
      {
        clientSongRequestID,
        clientSongRequestSecret,
        device,
        spotifyAccessToken,
        spotifyRefreshToken,
        streamer,
        twitchAccessToken,
        twitchRefreshToken,
        kickAccessToken,
      },
    ] = await getCredentials(name);
    const isSpotifyConnected = spotifyAccessToken && spotifyRefreshToken;
    const isStreamElementsConnected = clientSongRequestID && clientSongRequestSecret;
    const creddentials = {
      streamer,
      twitchAccessToken,
      twitchRefreshToken,
      isSpotifyConnected,
      isStreamElementsConnected,
      kickAccessToken,
    };

    if (streamer) {
      twitchAccessToken === token ? res.send(creddentials) : res.status(401).send({ message: "Unauthorized" });
    } else {
      res.status(404).send({ message: "This user doesn't exist" });
    }
  } catch {
    console.log("Error when get account");
    res.status(400).send({ message: "Not Found" });
  }
});

router.get("/riot", async (req, res): Promise<void> => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");

  const { name, token } = req.query;
  try {
    const [{ twitchAccessToken }] = await getCredentials(name.toString());
    const [data] = await getRiot(name.toString());

    if (data) {
      twitchAccessToken === token ? res.send(data) : res.status(401).send({ message: "Unauthorized" });
    } else {
      res.status(404).send({ message: "This riot data doesn't exist" });
    }
  } catch {
    console.log("Error when get riot data");
    res.status(400).send({ message: "Not Found" });
  }
});

router.get("/song", async (req, res): Promise<void> => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");

  const { name, token } = req.query;

  try {
    const [{ twitchAccessToken }] = await getCredentials(name.toString());
    const [data] = await getSong(name.toString());

    if (data) {
      twitchAccessToken === token ? res.send(data) : res.status(401).send({ message: "Unauthorized" });
    } else {
      res.status(404).send({ message: "This song data doesn't exist" });
    }
  } catch {
    console.log("Error when get song data");
    res.status(400).send({ message: "Not Found" });
  }
});

router.get("/commands", async (req, res): Promise<void> => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");

  const { name, token } = req.query;
  try {
    const [{ twitchAccessToken }] = await getCredentials(name.toString());
    const [data] = await getCommand(name.toString());

    if (data) {
      twitchAccessToken === token ? res.send(data) : res.status(401).send({ message: "Unauthorized" });
    } else {
      res.status(404).send({ message: "This user doesn't exist" });
    }
  } catch {
    console.log("Error when get command data");
    res.status(400).send({ message: "Not Found" });
  }
});

router.put("/streamelements", async (req, res): Promise<void> => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT");

  const { clientID, token, user } = req.body;

  try {
    await updateCredentials({
      streamer: user,
      clientSongRequestID: clientID,
      clientSongRequestSecret: token,
    });

    res.status(200).send({ message: "Successfully saved changes" });
  } catch {
    console.log("Error when get account");
    res.status(400).send({ message: "Something went wrong" });
  }
});

router.post("/sendmessage", async (req, res): Promise<void> => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST");
  const body = JSON.parse(req.body);

  try {
    sendMessage(body.message, body.streamer);
    if (body.addwinner) {
      const [{ wheelwinners }] = await getCommand(body.streamer);
      wheelwinners.length === 5 && wheelwinners.pop();
      const wheel = wheelwinners?.length ? [...wheelwinners, body.message] : [body.message];
      await updateCommand({
        streamer: body.streamer,
        wheelwinners: wheel,
      });
    }

    res.status(200).send({ message: "Successfully send message" });
  } catch {
    console.log("Error when send message");
    res.status(400).send({ message: "Something went wrong" });
  }
});

router.put("/volumeaward", async (req, res): Promise<void> => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT");
  const { min, max, minSR, maxSR, time, user } = req.body;

  try {
    const [data] = await getSong(user);
    const id = data?.volumeChanger?.id || "";

    await updateSong({
      streamer: user,
      volumeChanger: {
        id,
        min,
        max,
        minSR,
        maxSR,
        time,
      },
    });

    res.status(200).send({ message: "Successfully saved changes" });
  } catch {
    console.log("Error when set volumeChanger");
    res.status(400).send({ message: "Something went wrong" });
  }
});

router.put("/songqueue", async (req, res): Promise<void> => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT");
  const { isActive, size, pauseAfterRequest, user } = req.body;

  try {
    await updateSong({
      streamer: user,
      skipSongs: {
        isActive,
        size,
        pauseAfterRequest,
      },
    });

    res.status(200).send({ message: "Successfully saved changes" });
  } catch {
    console.log("Error when set song queue");
    res.status(400).send({ message: "Something went wrong" });
  }
});

router.put("/riot", async (req, res): Promise<void> => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT");

  const name = req.body.name;
  const server = req.body.server;
  const user = req.body.user;

  try {
    await addTftUser(name, server, user);
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

router.put("/riot-remove", async (req, res): Promise<void> => {
  res.header("Access-Control-Allow-Origin", "*");
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

router.put("/slots", async (req, res): Promise<void> => {
  res.header("Access-Control-Allow-Origin", "*");
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
    const [data] = await getCommand(user);

    if (data.slotsID && data.slotsID.length > 0) {
      await updateCommand({
        streamer: user,
        slotsID: [...data.slotsID, newSlots],
      });
    } else {
      await updateCommand({
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

router.put("/command_switch", async (req, res): Promise<void> => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT");

  const { user, body } = req.body;

  try {
    await updateCommand({
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

router.put("/slot_remove", async (req, res): Promise<void> => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT");

  const { id, user } = req.body;

  try {
    const [data] = await getCommand(user);
    const newSlotsList = data.slotsID.filter(slot => {
      return slot.name !== id;
    });

    await updateCommand({
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

router.post("/timeout", async (req, res): Promise<void> => {
  res.header("Access-Control-Allow-Origin", ["https://kacperacy.ovh/", "kacperacy.ovh"]);
  res.header("Access-Control-Allow-Methods", "POST");

  const { nick, streamer, time, message, userId } = req.body;

  try {
    timeout(nick, time, message, streamer, userId);

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

const kickPublicKeyPEM = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq/+l1WnlRrGSolDMA+A8
6rAhMbQGmQ2SapVcGM3zq8ANXjnhDWocMqfWcTd95btDydITa10kDvHzw9WQOqp2
MZI7ZyrfzJuz5nhTPCiJwTwnEtWft7nV14BYRDHvlfqPUaZ+1KR4OCaO/wWIk/rQ
L/TjY0M70gse8rlBkbo2a8rKhu69RQTRsoaf4DVhDPEeSeI5jVrRDGAMGL3cGuyY
6CLKGdjVEM78g3JfYOvDU/RvfqD7L89TZ3iN94jrmWdGz34JNlEI5hqK8dd7C5EF
BEbZ5jgB8s8ReQV8H+MkuffjdAj3ajDDX3DOJMIut1lBrUVD1AaSrGCKHooWoL2e
twIDAQAB
-----END PUBLIC KEY-----`;

function verifyKickSignature(req) {
  const messageId = req.headers["kick-event-message-id"];
  const timestamp = req.headers["kick-event-message-timestamp"];
  const signatureBase64 = Array.isArray(req.headers["kick-event-signature"])
    ? req.headers["kick-event-signature"][0]
    : req.headers["kick-event-signature"];

  if (!messageId || !timestamp || !signatureBase64) return false;

  const payload = `${messageId}.${timestamp}.${req.body.toString()}`;
  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(payload);
  verifier.end();

  return verifier.verify(kickPublicKeyPEM, signatureBase64, "base64");
}

router.post("/webhook", bodyParser.raw({ type: "*/*" }), (req, res) => {
  const eventType = req?.headers?.["kick-event-type"];
  console.log("Received event type:", eventType);
  if (eventType === "chat.message.sent") {
    console.log("✅ Otrzymano chat.message.sent", req.body?.content);
  } else {
    console.log(`ℹ️ Inny event type: ${eventType}`);
  }
  res.sendStatus(200);
});

export default router;
