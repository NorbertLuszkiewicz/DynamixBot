const ComfyJS = require("comfy.js");
const axios = require("axios");
const { messages, setTimeoutVolume } = require("./messages");
const { events } = require("./events");
const { commands } = require("./commands");
const { getAllUser } = require("../controllers/UserController.js");

let liveStreamers = [];

const setLiveStreamers = () => {
  try {
    setTimeout(async () => {
      const allStreamers = await getAllUser();
      
      const { data } = await axios.get(`https://api.twitch.tv/helix/streams`, {
      headers: {
 
        Authorization: `Bearer ${process.env.OAUTH}`,
        "Client-Id": `Bearer ${process.env.CLIENT_ID}`
      }
    });
      
      console.log(data)
      
      
    }, 30000);
  } catch (err) {
    console.log(`Error when getting liveStreamers ${err}`);
  }
};

const twitchCommands = async () => {
  try {
    messages();
    events();
    commands();
    setTimeoutVolume();
    setLiveStreamers()

    const allStreamers = await getAllUser();

    const TWITCHCHANNELS = allStreamers.map((streamer) => streamer.streamer);

    const TWITCHUSER = "dynam1x1";
    const OAUTH = process.env.OAUTH;

    ComfyJS.Init(TWITCHUSER, OAUTH, TWITCHCHANNELS);
  } catch (err) {
    console.log(`Error while connecting to twitch ${err}`);
  }
};

module.exports = {
  twitchCommands,
};
