const { TftApi, Constants } = require("twisted");
const { updateUser, getUser } = require("../controllers/UserController.js");

const api = new TftApi();

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
  
  data.riotAccountList.forEach( async({puuid, server})=>{
    const matchList = await api.Match.list(puuid, server);
    
    const today = ""
    
    const todayMatchList = ""
    
    console.log(matchList)
  })

  
};

module.exports = { addTftUser, tftMatchList };
