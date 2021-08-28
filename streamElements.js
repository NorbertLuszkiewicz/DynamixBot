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
const timeToReturnSpotify = 0;
const SONG_STATUS = "/player";
const SONG_QUEUE = "/queue";
const SONG_CURRENT = "/playing";
let allData ;

const callApi = (streamer, parameter, done) => {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", `${url}songrequest/${clientId[streamer]}${parameter}`, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + clientSecret[streamer]);
  xhr.send(null);
  xhr.onload = function() {
    const data = JSON.parse(this.responseText);
    done(data.state == "playing");
  };
};

const currentSong = (streamer, isPlaying, isSong) => {
  callApi(streamer, SONG_STATUS, isPlaying);
  callApi(streamer, SONG_CURRENT, isSong);
};

const songPlayingNow = (streamer, done) => {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", `${url}songrequest/${clientId[streamer]}/player`, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + clientSecret[streamer]);
  xhr.send(null);
  xhr.onload = function() {
    const data = JSON.parse(this.responseText);
    let xhr2 = new XMLHttpRequest();
    xhr2.open("GET", `${url}songrequest/${clientId[streamer]}/playing`, true);
    xhr2.setRequestHeader("Content-Type", "application/json");
    xhr2.setRequestHeader("Authorization", "Bearer " + clientSecret[streamer]);
    xhr2.send(null);
    xhr2.onload = function() {
      const data2 = JSON.parse(this.responseText);
      done(data.state == "playing" && data2 != null);
    };
  };
};

const returnSpotify = (streamer, returnSongFunction) => {
playing(streamer, addAllData )
  returnSongFunction(allData)
};


const playing = (streamer, done) => {
   let xhr = new XMLHttpRequest();
  xhr.open("GET", `${url}songrequest/${clientId[streamer]}/playing`, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + clientSecret[streamer]);
  xhr.send(null);
  xhr.onload = function() {
    const data = JSON.parse(this.responseText);   
    done(data);
  };
  
};
const queue = (streamer, done) => {
   let xhr = new XMLHttpRequest();
  xhr.open("GET", `${url}songrequest/${clientId[streamer]}/queue`, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + clientSecret[streamer]);
  xhr.send(null);
  xhr.onload = function() {
    const data = JSON.parse(this.responseText);   
    done(data);
  };
  
};

const player = (streamer, done) => {
   let xhr = new XMLHttpRequest();
  xhr.open("GET", `${url}songrequest/${clientId[streamer]}/player`, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + clientSecret[streamer]);
  xhr.send(null);
  xhr.onload = function() {
    const data = JSON.parse(this.responseText);   
    done(data);
  };
  
};


const addAllData = (data) => {
  console.log(data, "data")
allData = {}
}


module.exports = {
  returnSpotify,
  songPlayingNow
};
