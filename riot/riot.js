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

  const matchList = await api.Match.listWithDetails(
    data.activeRiotAccount.puuid,
    region[data.activeRiotAccount.server],
    { count: 10 }
  );
  const now = new Date();
  const today = Date.parse(
    `${now.getMonth() + 1}, ${now.getDate()}, ${now.getFullYear()} UTC`
  );
  const todayMatchList = matchList.filter(match => {
    if (match.info.game_datetime > today) {
      return match;
    }
  });

  if (todayMatchList.length > 0) {
    let matchListTwitch = `dzisiejsze gierki: `;

    todayMatchList.forEach((match, index) => {
      console.log(match);
      const myBoard = match.info.participants.find(item => {
        return item.puuid === data.activeRiotAccount.puuid;
      });

      const traits = myBoard.traits.sort((a, b) => b.num_units - a.num_units);

      const emote = [
        "EZ",
        "kezmanGlad",
        "kezmanGlad",
        "kezmanGlad",
        "Sadge ",
        "Sadge ",
        "Sadge ",
        "kezmanWrr"
      ];

      matchListTwitch =
        matchListTwitch +
        `${index + 1}[Top${myBoard.placement}]${
          traits[0].num_units
        }${traits[0].name.substr(5)}|${
          traits[1].num_units
        }${traits[1].name.substr(5)}|${
          traits[2].num_units
        }${traits[2].name.substr(5)} ${emote[myBoard.placement - 1]} `;
    });

    return matchListTwitch;
  }

  return `${streamer} nie zagrał dzisiaj żadnej gry`;
};

const getMatch = async (number, streamer) => {
  const [data] = await getUser(streamer);

  const { response } = await api.Match.list(
    data.activeRiotAccount.puuid,
    region[data.activeRiotAccount.server]
  );
  const matchList = response;

  const matchDetails = await api.Match.get(
    matchList[number - 1],
    region[data.activeRiotAccount.server]
  );

  const myBoard = matchDetails.response.info.participants.find(item => {
    return item.puuid === data.activeRiotAccount.puuid;
  });

  const correctTraits = myBoard.traits
    .filter(trait => trait.tier_current > 0)
    .sort((a, b) => b.num_units - a.num_units); 
  
  const correctUnits = myBoard.traits
    .sort((a, b) => b.items.length - a.items.length)
    .sort((a, b) => b.tier - a.tier)
    .sort((a, b) => b.rarity - a.rarity);

  let message = `[Top${myBoard.placement}] Level: ${myBoard.level} | `
  
  correctTraits.forEach(trait => {
    message = message + `${trait.name.substr(5)}*${trait.num_units}, `
  })
  
  message = message + "___________________________________________________"
  
  console.log(correctUnits);
  return message;
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

          const lastGameIsToday =
            lastMatch[0].info && lastMatch[0].info.game_datetime - today < 0;

          if (
            lastGameIsToday &&
            lastMatch[0].info.game_datetime >
              (streamer.activeRiotAccount ? streamer.activeRiotAccount.date : 0)
          ) {
            await updateUser({
              streamer: streamer.streamer,
              activeRiotAccount: {
                name,
                server,
                puuid,
                date: lastMatch[0].info.game_datetime
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

module.exports = { addTftUser, tftMatchList, checkActiveRiotAccount, getMatch };
