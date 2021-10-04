const ComfyJS = require("comfy.js");
const { messages } = require("./messages");
const { events } = require("./events");
const { commands } = require("./commands");
const { getAllUser } = require("../controllers/UserController.js");

const twitchCommends = () => {
  messages();
  events();
  commands();

  const TWITCHUSER = "dynam1x1";
  const TWITCHCHANNELS = async () => {
    try {
      return await getAllUser();
    } catch {}
  };
  const OAUTH = process.env.OAUTH;

 
  async ()=>{
   try{
      console.log(TWITCHCHANNELS, "TWITCHCHANNELS");
   }catch{}
    
  }

  ComfyJS.Init(TWITCHUSER, OAUTH, "dynam1x1");
};

module.exports = {
  twitchCommends
};
