var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const clientId = {process.env.SR_CLIENT_ID;}
const clientSecret = process.env.SR_CLIENT_SECRET;
const url = "https://api.streamelements.com/kappa/v2/"

const currentSong = () => {
 let xhr = new XMLHttpRequest();
  xhr.open("Get",`${url}/songrequest/${clientId}/player`, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + clientSecret);
  xhr.send(null);
  xhr.onload = handleApiResponse;
}

function handleApiResponse() {
  if (this.status == 200) {
    console.log(this.responseText, "SR currentSong");  
  } else {
    console.log(this.responseText, "ERROR SR currentSong ERROR");
  }
}