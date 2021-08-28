const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const clientId = {
  kezman22: process.env.SR_CLIENT_ID_KEZMAN,
  og1ii: process.env.SR_CLIENT_ID_OGI
};
const clientSecret = {
  kezman22: process.env.SR_CLIENT_SECRET_KEZMAN,
  og1ii: process.env.SR_CLIENT_SECRET_OGI
};
const url = "https://api.streamelements.com/kappa/v2/";
const SONG_STATUS = "/player";
const SONG_QUEUE = "/queue";


const callApi = (streamer, parameter ,done) => {
    let xhr = new XMLHttpRequest();
  xhr.open("GET", `${url}songrequest/${clientId[streamer]}${parameter}`, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + clientSecret[streamer]);
  xhr.send(null);
  xhr.onload = function () {
    const data = JSON.parse(this.responseText)
    done(data.state == "playing");
  };
}

const currentSong = (streamer, isPlaying,  )=> {
    
callApi(streamer, SONG_STATUS, done )
callApi(streamer, SONG_QUEUE, done )
  
};

const songList = (streamer, done)  => {
    let xhr = new XMLHttpRequest();
  xhr.open("GET", `${url}songrequest/${clientId[streamer]}/queue`, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + clientSecret[streamer]);
  xhr.send(null);
  xhr.onload = function () {
    const data = JSON.parse(this.responseText)
    console.log(data);
    done(null, data.length == 0);
  };
}

module.exports = {
  currentSong,
  songList
};
