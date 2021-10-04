const ComfyJS = require("comfy.js");
const { messages } = require("./messages");
const { events } = require("./events");
const { commands } = require("./commands");
const { getAllUser } = require("../controllers/UserController.js");

const twitchCommends = async () => {
  try {
    messages();
    events();
    commands();

    const allStreamers = await getAllUser();

    const TWITCHCHANNELS = allStreamers.map(streamer => streamer.streamer);
    const TWITCHUSER = "dynam1x1";
    const OAUTH = process.env.OAUTH;

    ComfyJS.Init(TWITCHUSER, OAUTH, TWITCHCHANNELS);
  } catch {
    console.log("Error");
  }
};

module.exports = {
  twitchCommends
};
