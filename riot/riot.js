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

const tftMatchList = async (streamer, nickname, server) => {
  const [data] = await getUser(streamer);

  let matchList;

  if (nickname) {
    const { response } = await api.Summoner.getByName(
      nickname,
      serverNameToServerId[server]
    );

    matchList = await api.Match.listWithDetails(
      response.puuid,
      server ? serverNameToServerId[server] : "EUW1",
      { count: 10 }
    );
  } else {
    matchList = await api.Match.listWithDetails(
      data.activeRiotAccount.puuid,
      region[data.activeRiotAccount.server],
      { count: 10 }
    );
  }

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

      matchListTwitch =
        matchListTwitch +
        `${index + 1}[Top${myBoard.placement}]${
          traits[0].num_units
        }${traits[0].name.substr(5)}|${
          traits[1].num_units
        }${traits[1].name.substr(5)}|${
          traits[2].num_units
        }${traits[2].name.substr(5)} `;
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

  const correctUnits = myBoard.units
    .sort((a, b) => b.rarity - a.rarity)
    .sort((a, b) => b.tier - a.tier)
    .sort((a, b) => b.items.length - a.items.length);

  let message = `[Top${myBoard.placement}] Level: ${myBoard.level} | `;

  correctTraits.forEach(trait => {
    message = message + `${trait.name.substr(5)}*${trait.num_units}, `;
  });

  message = message + "___________________________________________________";

  correctUnits.forEach(unit => {
    let items = "";

    if (unit.items.length > 0) {
      items = [];

      unit.items.forEach(item => {
        if (itemIdToName[item]) {
          items.push(itemIdToName[item]);
        }
      });

      items.length === 0 ? (items = "") : (items = `[${items}]`);
    }

    message = message + `${unit.tier}*${unit.character_id.substr(5)}${items}, `;
  });

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

const serverNameToServerId = {
  EUW: "EUW1",
  EUNE: "EUN1",
  NA: "NA1",
  KR: "KR"
};

const itemIdToName = {
  601: "AcE",
  604: "ArE",
  612: "AsE",
  626: "ChalE",
  630: "ChemE",
  675: "ImE",
  658: "ME",
  726: "SE",
  34: "AS",
  79: "BC",
  16: "BT",
  44: "Blue",
  55: "BV",
  46: "COP",
  11: "DB",
  66: "DC",
  45: "FH",
  56: "Garg",
  12: "GS",
  15: "GA",
  23: "GR",
  49: "HoJ",
  13: "Hex",
  19: "IE",
  36: "IS",
  39: "JG",
  29: "LW",
  35: "Lokt",
  37: "Mor",
  69: "QS",
  33: "Rab",
  22: "RFC",
  47: "Rdmp",
  26: "RH",
  59: "SoS",
  14: "Shoj",
  24: "SS",
  57: "Sun",
  88: "FoN",
  99: "TG",
  25: "TR",
  77: "WM",
  17: "Zeke",
  67: "Zeph",
  27: "ZZR"
};

module.exports = { addTftUser, tftMatchList, checkActiveRiotAccount, getMatch };
