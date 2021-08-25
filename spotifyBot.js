const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const accessToken = "";
const AUTHORIZE = "https://accounts.spotify.com/authorize";
const redirectUri = process.env.PROJECT_DOMAIN;

let url = `${AUTHORIZE}?client_id=${clientId}&response_type=code&redirect_uri=${encodeURI(
  redirectUri
)}&show_dialog=true&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private`;


const runApi = () => {console.log(url === url2, "urle")};
const startSong = () => {};
const pauseSong = () => {};

module.exports = { pauseSong, startSong, runApi };
