const { TftApi, Constants } = require("twisted");
const { updateUser, getUser } = require("../controllers/UserController.js");

const api = new TftApi();

const region = {
  EUW1: "EUROPE",
  EUN1: "EUROPE",
  NA1: "AMERICAS",
  KR: "ASIA",
}

const addTftUser = async (name, server, streamer) => {
  const [data] = await getUser(streamer);

  const { response } = await api.Summoner.getByName(name, server);

  const newRiotAccountList = data.riotAccountList
    ? [...data.riotAccountList, { name, server, puuid: response.puuid }]
    : [{ name, server, puuid: response.puuid }];

  await updateUser({
    streamer,
    riotAccountList: newRiotAccountList
  });
};
const tftMatchList = async streamer => {
  const [data] = await getUser(streamer);
  
//   data.riotAccountList.forEach( async({puuid, server})=>{
//     const matchList = await api.Match.listWithDetails(puuid, region[server], {count: 10});
    
//     const now = new Date();
    
//     const today = Date.parse(`${now.getMonth()+1}, ${now.getDate()}, ${now.getFullYear()} UTC`)
    
//     const todayMatchList = ""
    
//     console.log(matchList) 
//   })

  
};

const checkActiveRiotAccount = async ()=>{
    try {
    const streamers = await getAllUser();

    streamers.forEach(async streamer => {
      if (streamer.streamer != "og1ii" && streamer.spotifyRefreshToken) {
        const body = `grant_type=refresh_token&refresh_token=${streamer.spotifyRefreshToken}&client_id=${clientId}`;

        const { data } = await axios.post(`${TOKEN}`, body, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(
              clientId + ":" + clientSecret
            ).toString("base64")}`
          }
        });

        await updateUser({
          streamer: streamer.streamer,
          spotifyAccessToken: data.access_token,
          spotifyRefreshToken: data.refresh_token
        });
      }
    });
    console.log("reset spotify token");
  } catch ({ response }) {
    console.log(
      `Error while resetting Spotify token (${response.status} ${response.statusText})`
    );
  }
}

module.exports = { addTftUser, tftMatchList };
