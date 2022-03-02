const ComfyJS = require("comfy.js");
const { getWeather, getHoroscope } = require("./twitch");
const {
  tftMatchList,
  getMatch,
  getStats,
  getRank,
} = require("../riot/riot.js");
const { currentlyPlaying, nextSong, startSong } = require("../spotify");
const { songPlayingNow, timeRequest } = require("../streamElements");

let users = {};

const rewords = () =>
  (ComfyJS.onReward = async (user, reward, cost, message, extra) => {
    
    console.log(user, reward, cost, message, extra)
    
    
  });
 

module.exports = {
  rewords,
};
