var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const clientId = {
  kezman22: process.env.SR_CLIENT_ID_KEZMAN,
  og1ii: process.env.SR_CLIENT_ID_OGI
};
const clientSecret = {
  kezman22: process.env.SR_CLIENT_SECRET_KEZMAN,
  og1ii: process.env.SR_CLIENT_SECRET_OGI
};
const url = "https://api.streamelements.com/kappa/v2/";

const currentSong = streamer => {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", `${url}songrequest/${clientId[streamer]}/player`, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + clientSecret[streamer]);
  xhr.send(null);
  xhr.onload = handleApiResponse;
};

function handleApiResponse() {
  if (this.status == 200) {
    console.log(this.responseText == "playing");
    return this.responseText == "playing";
  } else {
    console.log(this.responseText, "ERROR SR currentSong ERROR");
  }
}

module.exports = {
  currentSong
};
