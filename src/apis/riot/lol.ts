import { TftApi, LolApi } from "twisted";
import { updateUser, getUser, getAllUser } from "../../controllers/UserController";
import { lolPosition, region, serverNameToServerId } from "../../types/riot";

const api = new TftApi();
const apiLol = new LolApi({
  key: process.env.RIOT_API_KEY_LOL,
});

const getMatchListText = (todayMatchList, puuid) => {
  //   1. [WIN]MID|VEX(12,4,5)-20212dmg(30%)|[duo] ...
  let matchListTwitch = `dzisiejsze gierki: `;

  todayMatchList.forEach((match, index) => {
    let personNrInTeam = 0;
    let teamDemageAll = 0;
    const myBoard = match.participants.find(item => {
      personNrInTeam = personNrInTeam + 1;
      return item.puuid === puuid;
    });
    match.participants.forEach((x, xIndex) => {
      if (personNrInTeam < 6 && xIndex < 5) {
        teamDemageAll = teamDemageAll + x.totalDamageDealtToChampions;
      } else if (personNrInTeam >= 6 && xIndex >= 5) {
        teamDemageAll = teamDemageAll + x.totalDamageDealtToChampions;
      }
    });

    const isWin = myBoard.win ? "WIN" : "LOSE";
    const position = lolPosition[myBoard.teamPosition];
    const totalDamageDealtToChampions = myBoard.totalDamageDealtToChampions;
    const teamDamagePercentage = ((totalDamageDealtToChampions / teamDemageAll) * 100).toFixed(0);
    const championName = myBoard.championName;
    const stats = `(${myBoard.kills},${myBoard.deaths},${myBoard.assists})`;

    matchListTwitch = `${matchListTwitch} ${
      index + 1
    }[${isWin}]${position}|${championName}${stats}|${totalDamageDealtToChampions}dmg(${teamDamagePercentage}%)`;
  });
  return matchListTwitch;
};

const getMatchList = async (data, nickname: string, server: string) => {
  let puuid = "";
  let matchIdList = [];
  if (nickname) {
    const { response } = await apiLol.Summoner.getByName(nickname, server ? serverNameToServerId[server] : "EUW1");

    matchIdList = (
      await apiLol.MatchV5.list(response.puuid, server ? region[serverNameToServerId[server]] : "EUROPE", { count: 10 })
    ).response;
    puuid = response.puuid;
  } else {
    const { response } = await apiLol.Summoner.getByName(
      data.activeRiotAccount?.name,
      data.activeRiotAccount?.server ? data.activeRiotAccount.server : "EUW1"
    );

    matchIdList = (await apiLol.MatchV5.list(response.puuid, region[data.activeRiotAccount.server], { count: 10 }))
      .response;

    puuid = response.puuid;
  }

  return { puuid, matchIdList };
};

export const getLolMatchStats = async (streamer: string, nickname: string, server: string): Promise<string> => {
  const [data] = await getUser(streamer);
  let matchList = [];
  const { puuid, matchIdList } = await getMatchList(data, nickname, server);
  const regionName = server ? region[serverNameToServerId[server]] : region[data.activeRiotAccount?.server];

  matchList = matchIdList.map(async id => {
    return (await apiLol.MatchV5.get(id, regionName))?.response?.info;
  });

  return Promise.all(matchList).then(matchList => {
    const now = new Date();
    const today = Date.parse(`${now.getMonth() + 1}, ${now.getDate()}, ${now.getFullYear()} UTC`);

    const todayMatchList = matchList.filter(match => {
      if (match.gameEndTimestamp > today) {
        return match;
      }
    });

    if (todayMatchList.length > 0) {
      //   1. [WIN]MID|VEX(12,4,5)-20212dmg(30%)|[duo] ...
      const matchListAnswer = getMatchListText(todayMatchList, puuid);
      return matchListAnswer;
    } else {
      return `${nickname ? nickname : streamer} nie zagrał dzisiaj żadnej gry`;
    }
  });
};

export const checkActiveRiotAccount = async (): Promise<void> => {
  try {
    const streamers = await getAllUser();

    streamers.forEach(async streamer => {
      if (streamer.riotAccountList && streamer.riotAccountList.length > 0) {
        streamer.riotAccountList.forEach(async ({ puuid, server, name, id }) => {
          const lastMatch = await api.Match.listWithDetails(puuid, region[server], { count: 1 });
          let summonerName = (await apiLol.Summoner.getByName(name, server ? server : "EUW1")).response;
          let lastMatchLol;

          if (summonerName) {
            const lastMatchLolId = (
              await apiLol.MatchV5.list(summonerName.puuid, region[server], {
                count: 1,
              })
            ).response;
            if (lastMatchLolId.length > 0) {
              lastMatchLol = (await apiLol.MatchV5.get(lastMatchLolId[0], region[server])).response;
            }
          }

          const isLol = lastMatchLol?.info?.gameEndTimestamp > lastMatch[0]?.info?.game_datetime;

          if (
            lastMatch[0]?.info?.game_datetime > (streamer.activeRiotAccount ? streamer.activeRiotAccount.date : 0) ||
            lastMatchLol?.info?.gameEndTimestamp > (streamer.activeRiotAccount ? streamer.activeRiotAccount.date : 0)
          ) {
            await updateUser({
              streamer: streamer.streamer,
              activeRiotAccount: {
                name,
                server,
                puuid,
                id,
                isLol,
                date: isLol ? lastMatchLol?.info?.gameEndTimestamp : lastMatch[0]?.info?.game_datetime || "",
              },
            });
          }
        });
      }
    });
  } catch ({ response }) {
    console.log(`Error while resetting last games in tft (${response.status} ${response.statusText})`);
  }
};
