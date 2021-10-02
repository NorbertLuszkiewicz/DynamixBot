const ComfyJS = require("comfy.js");
const { messages } = require("./messages");
const { events } = require("./events");
const { commands } = require("./commands");

const twitchCommends = () => {
  messages();
  events();
  commands();

  const TWITCHUSER = "dynam1x1";
  const TWITCHCHANNELS = [
    "kezman22",
    "simplywojtek",
    "og1ii",
    "l2plelouch",
    "dynam1x1"
  ];
  const OAUTH = process.env.OAUTH;

  ComfyJS.Init(TWITCHUSER, OAUTH, TWITCHCHANNELS);
};

module.exports = {
  twitchCommends
};
