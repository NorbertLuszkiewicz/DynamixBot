var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const clientId = process.env.SR_CLIENT_ID;
const clientSecret = process.env.SR_CLIENT_SECRET;

  let body = {};

  callApi(
    "PUT",
    PLAY + "?device_id=" + device[streamer],
    JSON.stringify(body),
    handleApiResponse
  );

function callApi(method, url, body, callback) {
  let xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
  xhr.send(body);
  xhr.onload = callback;
}

function handleApiResponse() {
  console.log("stop albo start");
  if (this.status == 200) {
    console.log(this.responseText, "response");
    action = "";
    setTimeout(currentlyPlaying, 1000);
  } else if (this.status == 204) {
    setTimeout(currentlyPlaying, 1000);
  } else if (this.status == 401) {
    console.log("stary token");
    refreshAccessToken();
  } else {
    console.log(this.responseText);
  }
}

const currentSong = () => {
  
}