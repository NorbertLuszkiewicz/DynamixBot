const ComfyJS = require("comfy.js");
const { messages, setTimeoutVolume } = require("./messages");
const { events } = require("./events");
const { commands } = require("./commands");
const { getAllUser } = require("../controllers/UserController.js");
const { isBlockedVideo } = require("../youtube");

const twitchCommands = async () => {
  try {
    messages();
    events();
    commands();
    setTimeoutVolume()
    isBlockedVideo("https://www.youtube.com/watch?v=Py9paavgZ-0&ab_channel=AxwellIngrossoVEVO","")
    
    const allStreamers = await getAllUser();

    const TWITCHCHANNELS = allStreamers.map(streamer => streamer.streamer);

    const TWITCHUSER = "dynam1x1";
    const OAUTH = process.env.OAUTH;

    ComfyJS.Init(TWITCHUSER, OAUTH, TWITCHCHANNELS);
  } catch (err) {
    console.log(`Error while connecting to twitch ${err}`);
  }
};

module.exports = {
  twitchCommands
};
