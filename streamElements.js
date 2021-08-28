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



const returnSpotify = (streamer, returnSongFunction) => {
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
      let xhr3 = new XMLHttpRequest();
      xhr3.open("GET", `${url}songrequest/${clientId[streamer]}/queue`, true);
      xhr3.setRequestHeader("Content-Type", "application/json");
      xhr3.setRequestHeader(
        "Authorization",
        "Bearer " + clientSecret[streamer]
      );
      xhr3.send(null);
      xhr3.onload = function() {
        const data3 = JSON.parse(this.responseText);
        returnSongFunction({ player: data, playing: data2, queue: data3 });
      };
    };
  };
};

const songPlayingNow = (streamer, done) => {
  returnSpotify(streamer, data => {
    console.log(data);

    done(data.player.state == "playing" && data.playing != null);
  });
};

const timeRequest = (streamer, returnData) => {
  returnSpotify(streamer, data => {
    console.log(data);

    returnData("działa");
  });
};

module.exports = {
  returnSpotify,
  songPlayingNow,
  timeRequest
};
