const axios = require("axios");
let token;

const setTwitchHelixToken = async () => {
  console.log("ttttt")
  const data = axios.post("https://id.twitch.tv/oauth2/token", {
    client_id: "bhwlcwuvtg51226poslegrqdcm8naz",
    client_secret: "j3up4evrkm7mbkgixcbafv7cjrrxw6",
    grant_type: "client_credentials",
  });
  console.log(await data.json(), "aaaa");

    token = data.access_token;
    // setTimeout(setTwitchHelixToken, data.expires_in - 4000);

};


module.exports = {
  setTwitchHelixToken
};