const { TftApi, Constants } = require("twisted");
const {
  updateUser,
  getUser,
  getAllUser
} = require("../controllers/UserController.js");

const api = new TftApi();

const region = {
  EUW1: "EUROPE",
  EUN1: "EUROPE",
  NA1: "AMERICAS",
  KR: "ASIA"
};

const addTftUser = async (name, server, streamer) => {
  const [data] = await getUser(streamer);

  const existThisAccount = data.riotAccountList.find(
    riotAccount => riotAccount.name == name
  );

  if (!existThisAccount) {
    const { response } = await api.Summoner.getByName(name, server);

    const newRiotAccountList = data.riotAccountList
      ? [...data.riotAccountList, { name, server, puuid: response.puuid }]
      : [{ name, server, puuid: response.puuid }];

    await updateUser({
      streamer,
      riotAccountList: newRiotAccountList
    });
  }
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

const checkActiveRiotAccount = async () => {
  try {
    const streamers = await getAllUser();

    streamers.forEach(async streamer => {
      await updateUser({
        streamer
      });
    });
    console.log("reset spotify token");
  } catch ({ response }) {
    console.log(
      `Error while resetting Spotify token (${response.status} ${response.statusText})`
    );
  }
};

module.exports = { addTftUser, tftMatchList };
