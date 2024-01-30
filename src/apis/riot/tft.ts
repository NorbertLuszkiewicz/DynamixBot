import { TftApi } from "twisted";
import { Regions } from "twisted/dist/constants";
import { MatchTFTDTO } from "twisted/dist/models-dto";
import { updateUser, getUser } from "../../controllers/UserController";
import { itemIdToName, region, serverNameToServerId } from "../../types/riot";

const api = new TftApi();

export const addTftUser = async (name: string, server: Regions, streamer: string): Promise<void> => {
  const [data] = await getUser(streamer);

  const existThisAccount = data.riotAccountList.find(
    riotAccount => riotAccount.name === name && riotAccount.server === server
  );

  if (!existThisAccount) {
    const { response } = await api.Summoner.getByName(name, server);

    const newRiotAccountList = data.riotAccountList
      ? [...data.riotAccountList, { name, server, puuid: response.puuid, id: response.id }]
      : [{ name, server, puuid: response.puuid, id: response.id }];

    await updateUser({
      streamer,
      riotAccountList: newRiotAccountList,
    });
  }
};

export const removeTftUser = async (name: string, server: string, streamer: string): Promise<void> => {
  const [data] = await getUser(streamer);

  const accounts = data.riotAccountList.filter(
    riotAccount => !(riotAccount.name === name && riotAccount.server === server)
  );

  await updateUser({
    streamer,
    riotAccountList: accounts,
  });
};

export const tftMatchList = async (streamer: string, nickname: string, server: string): Promise<string> => {
  const [data] = await getUser(streamer);
  let matchList: MatchTFTDTO[];
  let puuid = "";

  if (nickname) {
    const { response } = await api.Summoner.getByName(nickname, server ? serverNameToServerId[server] : "EUW1");

    matchList = await api.Match.listWithDetails(
      response.puuid,
      server ? region[serverNameToServerId[server]] : "EUROPE",
      { count: 10 }
    );
    puuid = response.puuid;
  } else {
    matchList = await api.Match.listWithDetails(data.activeRiotAccount.puuid, region[data.activeRiotAccount.server], {
      count: 10,
    });
    puuid = data.activeRiotAccount.puuid;
  }

  const now = new Date();
  const today = Date.parse(`${now.getMonth() + 1}, ${now.getDate()}, ${now.getFullYear()} UTC`);
  const todayMatchList = matchList.filter(match => {
    if (match.info.game_datetime > today) {
      return match;
    }
  });

  if (todayMatchList.length > 0) {
    let matchListTwitch = `dzisiejsze gierki: `;

    todayMatchList.forEach((match, index) => {
      const myBoard = match.info.participants.find(item => {
        return item.puuid === puuid;
      });

      const traits = myBoard.traits.sort((a, b) => b.num_units - a.num_units);

      matchListTwitch =
        matchListTwitch +
        `${index + 1}[Top${myBoard.placement}]${traits[0].num_units}${traits[0].name.substr(5)}|${
          traits[1].num_units
        }${traits[1].name.substr(5)}|${traits[2].num_units}${traits[2].name.substr(5)} `;
    });

    return matchListTwitch;
  }

  return `${nickname ? nickname : streamer} nie zagrał dzisiaj żadnej gry`;
};

export const getMatch = async (number, nickname: string, server: string, streamer: string): Promise<string> => {
  if (!number) {
    return "@${user} komenda !mecze pokazuje liste meczy z dzisiaj (miejsca o raz synergie) !mecz [nr] gdzie [nr] oznacza numer meczu licząc od najnowszego czyli !mecz 1 pokaze ostatnią gre (wyświetla dokładny com z itemami i synergiami)";
  }

  const [data] = await getUser(streamer);
  let puuid = data.activeRiotAccount.puuid;
  let gameRegion = nickname ? "EUROPE" : region[data.activeRiotAccount.server];

  if (nickname) {
    const summoner = await api.Summoner.getByName(nickname, server ? serverNameToServerId[server] : "EUW1");
    gameRegion = server ? region[serverNameToServerId[server]] : "EUROPE";
    puuid = summoner.response.puuid;
  }

  const { response } = await api.Match.list(puuid, gameRegion);
  const matchList = response;

  const matchDetails = await api.Match.get(matchList[number - 1], gameRegion);

  const myBoard: any = matchDetails.response.info.participants.find(item => {
    return item.puuid === puuid;
  });

  const augments = [];
  myBoard.augments.map(augment => {
    const correctAugment = augment.substr(13).replace(/([A-Z])/g, " $1");

    augments.push(correctAugment.charAt(0).toUpperCase() + correctAugment.slice(1));
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

  message = message + `| ${augments} `;

  message = message + "___________________________________________________";

  correctUnits.forEach(unit => {
    let itemList: string = "";

    if (unit.items.length > 0) {
      const items = unit.items.map(x => itemIdToName[x]).filter(x => x);
      itemList = `[${items}]`;
    }

    message = message + `${unit.tier}*${unit.character_id.substr(5)}${itemList}, `;
  });

  return message;
};

export const getStats = async (streamer: string, nickname: string, server: string): Promise<string> => {
  const [data] = await getUser(streamer);
  let message = "";

  if (nickname) {
    const { response } = await api.Summoner.getByName(nickname, server ? serverNameToServerId[server] : "EUW1");
    const userData = await api.League.get(response.id, server ? serverNameToServerId[server] : "EUW1");
    const userInfo = userData.response[0];

    message = `statystyki gracza: ${response.name} | ${userInfo.tier}-${userInfo.rank} ${userInfo.leaguePoints}LP ${
      userInfo.wins
    }wins ${userInfo.wins + userInfo.loses}games`;

    return message;
  } else {
    const userData = await api.League.get(data.activeRiotAccount.id, data.activeRiotAccount.server);
    const userInfo = userData.response[0];

    message = `statystyki gracza: ${data.activeRiotAccount.name} | ${userInfo.tier}-${userInfo.rank} ${
      userInfo.leaguePoints
    }LP ${userInfo.wins}wins ${userInfo.wins + userInfo.loses}games`;
    return message;
  }
};

export const getLolStats = async (streamer: string, nickname: string, server: string): Promise<string> => {
  const [data] = await getUser(streamer);
  let message = "";

  if (nickname) {
    const { response } = await api.Summoner.getByName(nickname, server ? serverNameToServerId[server] : "EUW1");
    const userData = await api.League.get(response.id, server ? serverNameToServerId[server] : "EUW1");
    const userInfo = userData.response[0];

    message = `statystyki gracza: ${response.name} | ${userInfo.tier}-${userInfo.rank} ${userInfo.leaguePoints}LP ${
      userInfo.wins
    }wins ${userInfo.wins + userInfo.loses}games`;

    return message;
  } else {
    const userData = await api.League.get(data.activeRiotAccount.id, data.activeRiotAccount.server);
    const userInfo = userData.response[0];

    message = `statystyki gracza: ${data.activeRiotAccount.name} | ${userInfo.tier}-${userInfo.rank} ${
      userInfo.leaguePoints
    }LP ${userInfo.wins}wins ${userInfo.wins + userInfo.loses}games`;
    return message;
  }
};

export const getRank = async (server: string): Promise<string> => {
  const { response: chall } = await api.League.getChallengerLeague(server ? serverNameToServerId[server] : "EUW1");
  let message = "";
  let topRank = [];

  if (chall.entries.length > 10) {
    topRank = chall.entries.sort((a, b) => b.leaguePoints - a.leaguePoints).slice(0, 10);
  } else {
    topRank = chall.entries.sort((a, b) => b.leaguePoints - a.leaguePoints);
  }

  if (topRank.length !== 10) {
    const { response: grand } = await api.League.getGrandMasterLeague(server ? serverNameToServerId[server] : "EUW1");
    if (grand.entries.length > 10 - topRank.length) {
      topRank = [
        ...topRank,
        ...grand.entries.sort((a, b) => b.leaguePoints - a.leaguePoints).slice(0, 10 - topRank.length),
      ];
    } else {
      topRank = [...topRank, ...grand.entries];
    }
  }

  if (topRank.length !== 10) {
    const { response: master } = await api.League.getMasterLeague(server ? serverNameToServerId[server] : "EUW1");
    if (master.entries.length > 10 - topRank.length) {
      topRank = [
        ...topRank,
        ...master.entries.sort((a, b) => b.leaguePoints - a.leaguePoints).slice(0, 10 - topRank.length),
      ];
    } else {
      topRank = [...topRank, ...master.entries];
    }
  }

  const sortedTopRank = topRank.sort((a, b) => b.leaguePoints - a.leaguePoints);

  sortedTopRank.forEach((user, index) => {
    message = `${message} TOP${index + 1} ${user.summonerName} ${user.leaguePoints} LP, `;
  });
  return message;
};
