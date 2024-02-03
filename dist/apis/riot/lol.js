"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkActiveRiotAccount = exports.updateRiotItemsAndChampions = exports.getLolMatch = exports.getLolUserStats = exports.getLolMatchStats = void 0;
const axios_1 = __importDefault(require("axios"));
const twisted_1 = require("twisted");
const UserController_1 = require("../../controllers/UserController");
const helpers_1 = require("../../helpers");
const api = new twisted_1.TftApi();
const apiLol = new twisted_1.LolApi({
    key: process.env.RIOT_API_KEY_LOL,
});
let LOL_ITEMS;
let LOL_CHAMPIONS;
const convertChampionIdToName = (id) => {
    const champions = LOL_CHAMPIONS.data;
    for (const name in champions) {
        if (id == champions[name].key)
            return name;
    }
};
const getMatchText = (data, puuid) => {
    const me = data.participants.filter(x => x.puuid === puuid)[0];
    const myTeam = data.participants.filter(x => x.teamId === me.teamId);
    const myTeamWithoutMe = myTeam.filter(x => x.puuid !== puuid);
    const myTeamStats = myTeamWithoutMe.map(m => {
        return {
            accountName: m.riotIdGameName,
            position: helpers_1.lolPosition[m === null || m === void 0 ? void 0 : m.teamPosition],
            totalDamageDealtToChampions: m === null || m === void 0 ? void 0 : m.totalDamageDealtToChampions,
            championName: m === null || m === void 0 ? void 0 : m.championName,
            stats: `(${m === null || m === void 0 ? void 0 : m.kills},${m === null || m === void 0 ? void 0 : m.deaths},${m === null || m === void 0 ? void 0 : m.assists})`,
        };
    });
    const isWin = (me === null || me === void 0 ? void 0 : me.win) ? "WIN" : "LOSE";
    const gameEndTimestamp = data.gameEndTimestamp ? `| ${new Date(data.gameEndTimestamp).toLocaleString()}` : "";
    const position = helpers_1.lolPosition[me === null || me === void 0 ? void 0 : me.teamPosition];
    const totalDamageDealtToChampions = me === null || me === void 0 ? void 0 : me.totalDamageDealtToChampions;
    const championName = me === null || me === void 0 ? void 0 : me.championName;
    const totalTeamDamage = myTeam.reduce((prev, curr) => prev + curr.totalDamageDealtToChampions, 0);
    const teamDamagePercentage = ((totalDamageDealtToChampions / totalTeamDamage) * 100).toFixed(0);
    const stats = `(${me === null || me === void 0 ? void 0 : me.kills},${me === null || me === void 0 ? void 0 : me.deaths},${me === null || me === void 0 ? void 0 : me.assists})`;
    const itemIdList = [me.item0, me.item1, me.item2, me.item3, me.item4, me.item5].filter(x => x);
    const itemList = itemIdList.map(item => LOL_ITEMS.data[item].name).filter(x => x);
    // [WIN] MID | Sylas(20,5,3) | 40181dmg(28%)
    let message = `[${isWin}] ${position} | ${championName}${stats} | ${totalDamageDealtToChampions}dmg(${teamDamagePercentage}%) | trwała ${Math.ceil(data.gameDuration / 60)}min ${gameEndTimestamp}`;
    message += ` ___________________________________________________ `;
    message += ` [${itemList.join(" | ")}]`;
    message += ` ___________________________________________________ `;
    message += myTeamStats
        .map(stats => {
        return `[${stats.accountName}]${stats.position}|${stats.championName}${stats.stats}|dmg(${((stats.totalDamageDealtToChampions / totalTeamDamage) *
            100).toFixed(0)}%)`;
    })
        .join(", ");
    return message;
};
const getMatchListText = (todayMatchList, puuid) => {
    //   1. [WIN]MID|VEX(12,4,5)-20212dmg(30%)...
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
            }
            else if (personNrInTeam >= 6 && xIndex >= 5) {
                teamDemageAll = teamDemageAll + x.totalDamageDealtToChampions;
            }
        });
        const isWin = myBoard.win ? "WIN" : "LOSE";
        const position = helpers_1.lolPosition[myBoard.teamPosition];
        const totalDamageDealtToChampions = myBoard.totalDamageDealtToChampions;
        const teamDamagePercentage = ((totalDamageDealtToChampions / teamDemageAll) * 100).toFixed(0);
        const championName = myBoard.championName;
        const stats = `(${myBoard.kills},${myBoard.deaths},${myBoard.assists})`;
        matchListTwitch = `${matchListTwitch} ${index + 1}[${isWin}]${position}|${championName}${stats}|${totalDamageDealtToChampions}dmg(${teamDamagePercentage}%)`;
    });
    return matchListTwitch;
};
const getMatchList = (data, nickname, server) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let puuid = "";
    let matchIdList = [];
    try {
        if (nickname) {
            const { response } = yield apiLol.Summoner.getByName(nickname, server ? helpers_1.serverNameToServerId[server] : "EUW1");
            matchIdList = (yield apiLol.MatchV5.list(response.puuid, server ? helpers_1.region[helpers_1.serverNameToServerId[server]] : "EUROPE", {
                count: 10,
            })).response;
            puuid = response.puuid;
        }
        else {
            const { response } = yield apiLol.Summoner.getByName((_a = data.activeRiotAccount) === null || _a === void 0 ? void 0 : _a.name, ((_b = data.activeRiotAccount) === null || _b === void 0 ? void 0 : _b.server) ? data.activeRiotAccount.server : "EUW1");
            matchIdList = (yield apiLol.MatchV5.list(response.puuid, helpers_1.region[data.activeRiotAccount.server], { count: 10 }))
                .response;
            puuid = response.puuid;
        }
        return { puuid, matchIdList };
    }
    catch (err) {
        console.log("Error while getting lol matches" + err);
    }
});
const getLolUserStatsText = (name, userInfo, mastery) => {
    const masteryToText = mastery
        .map(m => `${convertChampionIdToName(m.championId)} (${m.championPoints.toLocaleString()} pkt)`)
        .filter(x => x)
        .join(" | ");
    const wr = ((userInfo.wins / (userInfo.wins + userInfo.losses)) * 100).toFixed(1);
    return `statystyki LOL dla gracza: ${name} | ${userInfo === null || userInfo === void 0 ? void 0 : userInfo.tier}${"-" + (userInfo === null || userInfo === void 0 ? void 0 : userInfo.rank)} ${userInfo.leaguePoints}LP ${userInfo.wins}wins ${userInfo.wins + userInfo.losses}games ( ${wr}% wr) | Mastery (${masteryToText})`;
};
const getLolMatchStats = (streamer, nickname, server) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const [data] = yield (0, UserController_1.getUser)(streamer);
    let matchList = [];
    try {
        const { puuid, matchIdList } = yield getMatchList(data, nickname, server);
        const regionName = server ? helpers_1.region[helpers_1.serverNameToServerId[server]] : helpers_1.region[(_c = data.activeRiotAccount) === null || _c === void 0 ? void 0 : _c.server];
        matchList = matchIdList.map((id) => __awaiter(void 0, void 0, void 0, function* () {
            var _d, _e;
            return (_e = (_d = (yield apiLol.MatchV5.get(id, regionName))) === null || _d === void 0 ? void 0 : _d.response) === null || _e === void 0 ? void 0 : _e.info;
        }));
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
            }
            else {
                return `${nickname ? nickname : streamer} nie zagrał dzisiaj żadnej gry`;
            }
        });
    }
    catch (err) {
        console.log("Error while getting lol matches stats" + err);
        const message = `Nie znaleziono meczy LOL z dzisiaj dla ${nickname ? nickname + "#" + (server || "EUW") : `streamera`}`;
        return message;
    }
});
exports.getLolMatchStats = getLolMatchStats;
const getLolUserStats = (streamer, nickname, server) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    const [data] = yield (0, UserController_1.getUser)(streamer);
    const lolRegion = server ? helpers_1.serverNameToServerId[server] : "EUW1";
    let puuid = data.activeRiotAccount.lol_puuid;
    let message = "";
    try {
        if (nickname) {
            const { response } = yield apiLol.Summoner.getByName(nickname, lolRegion);
            const userData = yield apiLol.League.bySummoner(response.id, lolRegion);
            const userInfo = userData.response.filter(x => x.queueType === "RANKED_SOLO_5x5")[0];
            puuid = response.puuid;
            const userDetails = yield axios_1.default.get(`https://${lolRegion}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}?api_key=${process.env.RIOT_API_KEY_LOL}`);
            message = getLolUserStatsText(response.name, userInfo, userDetails === null || userDetails === void 0 ? void 0 : userDetails.data.slice(0, 3));
        }
        else {
            const userData = yield apiLol.League.bySummoner(data.activeRiotAccount.lol_id, data.activeRiotAccount.server);
            const userInfo = userData.response.filter(x => x.queueType === "RANKED_SOLO_5x5")[0];
            const userDetails = yield axios_1.default.get(`https://${lolRegion}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}?api_key=${process.env.RIOT_API_KEY_LOL}`);
            message = getLolUserStatsText(data.activeRiotAccount.name, userInfo, (_f = userDetails === null || userDetails === void 0 ? void 0 : userDetails.data) === null || _f === void 0 ? void 0 : _f.slice(0, 3));
        }
        return message;
    }
    catch (err) {
        console.log("Error while getting lol user stats" + err);
        message = `Nie znaleziono statystyk LOL dla ${nickname ? nickname + "#" + (server || "EUW") : `streamera`}`;
        return message;
    }
});
exports.getLolUserStats = getLolUserStats;
const getLolMatch = (number, nickname, server, streamer) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    let message = "";
    if (!number) {
        return "@${user} komenda !mecze pokazuje liste meczy z dzisiaj (miejsca o raz synergie) !mecz [nr] gdzie [nr] oznacza numer meczu licząc od najnowszego czyli !mecz 1 pokaze ostatnią gre (wyświetla dokładny com z itemami i synergiami)";
    }
    try {
        const [data] = yield (0, UserController_1.getUser)(streamer);
        let puuid = data.activeRiotAccount.lol_puuid;
        let gameRegion = nickname ? "EUROPE" : helpers_1.region[data.activeRiotAccount.server];
        if (nickname) {
            const summoner = yield apiLol.Summoner.getByName(nickname, server ? helpers_1.serverNameToServerId[server] : "EUW1");
            gameRegion = server ? helpers_1.region[helpers_1.serverNameToServerId[server]] : "EUROPE";
            puuid = summoner.response.puuid;
        }
        const matchList = yield apiLol.MatchV5.list(puuid, gameRegion, { count: number });
        const matchDetails = yield apiLol.MatchV5.get(matchList.response.at(-1), gameRegion);
        return getMatchText((_g = matchDetails === null || matchDetails === void 0 ? void 0 : matchDetails.response) === null || _g === void 0 ? void 0 : _g.info, puuid);
    }
    catch (err) {
        console.log("Error while getting lol user match" + err);
        message = `Nie znaleziono meczu LOL dla ${nickname ? nickname + "#" + (server || "EUW") : `streamera`}`;
        return message;
    }
});
exports.getLolMatch = getLolMatch;
const updateRiotItemsAndChampions = () => __awaiter(void 0, void 0, void 0, function* () {
    const lolItems = yield axios_1.default.get("https://ddragon.leagueoflegends.com/cdn/14.2.1/data/en_US/item.json");
    const lolChampionss = yield axios_1.default.get("https://ddragon.leagueoflegends.com/cdn/14.2.1/data/en_US/champion.json");
    LOL_ITEMS = lolItems.data;
    LOL_CHAMPIONS = lolChampionss.data;
});
exports.updateRiotItemsAndChampions = updateRiotItemsAndChampions;
const checkActiveRiotAccount = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const streamers = yield (0, UserController_1.getAllUser)();
        streamers.forEach((streamer) => __awaiter(void 0, void 0, void 0, function* () {
            if (streamer.riotAccountList && streamer.riotAccountList.length > 0) {
                streamer.riotAccountList.forEach(({ puuid, server, name, id, lol_puuid, lol_id }) => __awaiter(void 0, void 0, void 0, function* () {
                    var _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
                    const lastMatch = yield api.Match.listWithDetails(puuid, helpers_1.region[server], { count: 1 });
                    let summonerName = (yield apiLol.Summoner.getByName(name, server ? server : "EUW1")).response;
                    let lastMatchLol;
                    if (summonerName) {
                        const lastMatchLolId = (yield apiLol.MatchV5.list(summonerName.puuid, helpers_1.region[server], {
                            count: 1,
                        })).response;
                        const OUTDATED_MATCH_ID = "EUW1_5273890293";
                        if (lastMatchLolId.length > 0 && lastMatchLolId[0] !== OUTDATED_MATCH_ID) {
                            lastMatchLol = ((_h = (yield apiLol.MatchV5.get(lastMatchLolId[0], helpers_1.region[server]))) === null || _h === void 0 ? void 0 : _h.response) || "";
                        }
                    }
                    const isLol = ((_j = lastMatchLol === null || lastMatchLol === void 0 ? void 0 : lastMatchLol.info) === null || _j === void 0 ? void 0 : _j.gameEndTimestamp) > ((_l = (_k = lastMatch[0]) === null || _k === void 0 ? void 0 : _k.info) === null || _l === void 0 ? void 0 : _l.game_datetime);
                    if (((_o = (_m = lastMatch[0]) === null || _m === void 0 ? void 0 : _m.info) === null || _o === void 0 ? void 0 : _o.game_datetime) > (streamer.activeRiotAccount ? streamer.activeRiotAccount.date : 0) ||
                        ((_p = lastMatchLol === null || lastMatchLol === void 0 ? void 0 : lastMatchLol.info) === null || _p === void 0 ? void 0 : _p.gameEndTimestamp) > (streamer.activeRiotAccount ? streamer.activeRiotAccount.date : 0)) {
                        yield (0, UserController_1.updateUser)({
                            streamer: streamer.streamer,
                            activeRiotAccount: {
                                name,
                                server,
                                puuid,
                                id,
                                lol_puuid,
                                lol_id,
                                isLol,
                                date: isLol ? (_q = lastMatchLol === null || lastMatchLol === void 0 ? void 0 : lastMatchLol.info) === null || _q === void 0 ? void 0 : _q.gameEndTimestamp : ((_s = (_r = lastMatch[0]) === null || _r === void 0 ? void 0 : _r.info) === null || _s === void 0 ? void 0 : _s.game_datetime) || "",
                            },
                        });
                    }
                }));
            }
        }));
    }
    catch ({ response }) {
        console.log(`Error while resetting active riot account (${response.status} ${response.statusText})`);
    }
});
exports.checkActiveRiotAccount = checkActiveRiotAccount;
//# sourceMappingURL=lol.js.map