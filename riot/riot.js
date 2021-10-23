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
    riotAccount => riotAccount.name == name && riotAccount.server == server
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

  if (data) {
    //       const matchList = await api.Match.listWithDetails(puuid, region[server], {count: 10});
    //       const now = new Date();
    //       const today = Date.parse(`${now.getMonth()+1}, ${now.getDate()}, ${now.getFullYear()} UTC`)
    //       const todayMatchList = matchList.map((match)=>{
    //          if(match.info.game_datetime > today){return match}
    //       })
    //       console.log(matchList)
  }
};
const checkActiveRiotAccount = async () => {
  try {
    const streamers = await getAllUser();

    streamers.forEach(async streamer => {
      if (streamer.riotAccountList) {
        streamer.riotAccountList.forEach(async ({ puuid, server, name }) => {
          const lastMatch = await api.Match.listWithDetails(
            puuid,
            region[server],
            { count: 1 }
          );

          const now = new Date();
          const today = Date.parse(
            `${now.getMonth() + 1}, ${now.getDate()}, ${now.getFullYear()} UTC`
          );
          console.log(lastMatch[0].info.game_datetime);
          const lastGameIsToday =
            lastMatch[0].info && lastMatch[0].info.game_datetime - today < 0;

          if (
            lastGameIsToday &&
            lastMatch[0].info.game_datetime > streamer.activeRiotAccount.date
          ) {
            await updateUser({
              streamer,
              activeRiotAccount: {
                name,
                server,
                date: lastMatch.info.game_datetime
              }
            });
          }
        });
      }
    });
    console.log("reset last games in tft");
  } catch ({ response }) {
    console.log(
      `Error while resetting last games in tft (${response.status} ${response.statusText})`
    );
  }
};

module.exports = { addTftUser, tftMatchList, checkActiveRiotAccount };
