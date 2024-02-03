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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkActiveRiotAccount = exports.getRank = exports.getLolStats = exports.getStats = exports.getMatch = exports.tftMatchList = exports.removeTftUser = exports.addTftUser = exports.getLolMatchStats = void 0;
const twisted_1 = require("twisted");
const UserController_1 = require("../../controllers/UserController");
const api = new twisted_1.TftApi();
const apiLol = new twisted_1.LolApi({
    key: process.env.RIOT_API_KEY_LOL,
});
const region = {
    EUW1: "EUROPE",
    EUN1: "EUROPE",
    NA1: "AMERICAS",
    KR: "ASIA",
};
const getLolMatchStats = (streamer, nickname, server) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const [data] = yield (0, UserController_1.getUser)(streamer);
    let matchList = [];
    let matchIdList = [];
    let puuid = "";
    if (nickname) {
        const { response } = yield apiLol.Summoner.getByName(nickname, server ? serverNameToServerId[server] : "EUW1");
        matchIdList = (yield apiLol.MatchV5.list(response.puuid, server ? region[serverNameToServerId[server]] : "EUROPE", { count: 10 })).response;
        puuid = response.puuid;
    }
    else {
        const { response } = yield apiLol.Summoner.getByName((_a = data.activeRiotAccount) === null || _a === void 0 ? void 0 : _a.name, ((_b = data.activeRiotAccount) === null || _b === void 0 ? void 0 : _b.server) ? data.activeRiotAccount.server : "EUW1");
        matchIdList = (yield apiLol.MatchV5.list(response.puuid, region[data.activeRiotAccount.server], { count: 10 }))
            .response;
        puuid = response.puuid;
    }
    matchList = matchIdList.map((x) => __awaiter(void 0, void 0, void 0, function* () {
        var _c, _d, _e;
        return (_e = (_d = (yield apiLol.MatchV5.get(x, server ? region[serverNameToServerId[server]] : region[(_c = data.activeRiotAccount) === null || _c === void 0 ? void 0 : _c.server]))) === null || _d === void 0 ? void 0 : _d.response) === null || _e === void 0 ? void 0 : _e.info;
    }));
    return Promise.all(matchList).then(matchList => {
        const now = new Date();
        const today = Date.parse(`${now.getMonth() + 1}, ${now.getDate()}, ${now.getFullYear()} UTC`);
        const todayMatchList = matchList.filter(match => {
            if (match.gameEndTimestamp > today) {
                return match;
            }
        });
        //   1. [WIN]MID|VEX(12,4,5)-20212dmg(30%)|[duo]
        if (todayMatchList.length > 0) {
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
                const position = lolPosition[myBoard.teamPosition];
                const totalDamageDealtToChampions = myBoard.totalDamageDealtToChampions;
                const teamDamagePercentage = ((totalDamageDealtToChampions / teamDemageAll) * 100).toFixed(0);
                const championName = myBoard.championName;
                const stats = `(${myBoard.kills},${myBoard.deaths},${myBoard.assists})`;
                // const role = myBoard.role == "DUO" ? "duo" : "solo";
                matchListTwitch = `${matchListTwitch} ${index + 1}[${isWin}]${position}|${championName}${stats}|${totalDamageDealtToChampions}dmg(${teamDamagePercentage}%)`;
            });
            return matchListTwitch;
        }
        else {
            return `${nickname ? nickname : streamer} nie zagrał dzisiaj żadnej gry`;
        }
    });
});
exports.getLolMatchStats = getLolMatchStats;
const addTftUser = (name, server, streamer) => __awaiter(void 0, void 0, void 0, function* () {
    const [data] = yield (0, UserController_1.getUser)(streamer);
    const existThisAccount = data.riotAccountList.find(riotAccount => riotAccount.name == name && riotAccount.server == server);
    if (!existThisAccount) {
        const { response } = yield api.Summoner.getByName(name, server);
        const newRiotAccountList = data.riotAccountList
            ? [...data.riotAccountList, { name, server, puuid: response.puuid, id: response.id }]
            : [{ name, server, puuid: response.puuid, id: response.id }];
        yield (0, UserController_1.updateUser)({
            streamer,
            riotAccountList: newRiotAccountList,
        });
    }
});
exports.addTftUser = addTftUser;
const removeTftUser = (name, server, streamer) => __awaiter(void 0, void 0, void 0, function* () {
    const [data] = yield (0, UserController_1.getUser)(streamer);
    const accounts = data.riotAccountList.filter(riotAccount => !(riotAccount.name === name && riotAccount.server === server));
    yield (0, UserController_1.updateUser)({
        streamer,
        riotAccountList: accounts,
    });
});
exports.removeTftUser = removeTftUser;
const tftMatchList = (streamer, nickname, server) => __awaiter(void 0, void 0, void 0, function* () {
    const [data] = yield (0, UserController_1.getUser)(streamer);
    let matchList;
    let puuid = "";
    if (nickname) {
        const { response } = yield api.Summoner.getByName(nickname, server ? serverNameToServerId[server] : "EUW1");
        matchList = yield api.Match.listWithDetails(response.puuid, server ? region[serverNameToServerId[server]] : "EUROPE", { count: 10 });
        puuid = response.puuid;
    }
    else {
        matchList = yield api.Match.listWithDetails(data.activeRiotAccount.puuid, region[data.activeRiotAccount.server], {
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
                    `${index + 1}[Top${myBoard.placement}]${traits[0].num_units}${traits[0].name.substr(5)}|${traits[1].num_units}${traits[1].name.substr(5)}|${traits[2].num_units}${traits[2].name.substr(5)} `;
        });
        return matchListTwitch;
    }
    return `${nickname ? nickname : streamer} nie zagrał dzisiaj żadnej gry`;
});
exports.tftMatchList = tftMatchList;
const getMatch = (number, nickname, server, streamer) => __awaiter(void 0, void 0, void 0, function* () {
    if (!number) {
        return "@${user} komenda !mecze pokazuje liste meczy z dzisiaj (miejsca o raz synergie) !mecz [nr] gdzie [nr] oznacza numer meczu licząc od najnowszego czyli !mecz 1 pokaze ostatnią gre (wyświetla dokładny com z itemami i synergiami)";
    }
    const [data] = yield (0, UserController_1.getUser)(streamer);
    let puuid = data.activeRiotAccount.puuid;
    let gameRegion = nickname ? "EUROPE" : region[data.activeRiotAccount.server];
    if (nickname) {
        const summoner = yield api.Summoner.getByName(nickname, server ? serverNameToServerId[server] : "EUW1");
        gameRegion = server ? region[serverNameToServerId[server]] : "EUROPE";
        puuid = summoner.response.puuid;
    }
    const { response } = yield api.Match.list(puuid, gameRegion);
    const matchList = response;
    const matchDetails = yield api.Match.get(matchList[number - 1], gameRegion);
    const myBoard = matchDetails.response.info.participants.find(item => {
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
        let itemList = "";
        if (unit.items.length > 0) {
            const items = unit.items.map(x => itemIdToName[x]).filter(x => x);
            itemList = `[${items}]`;
        }
        message = message + `${unit.tier}*${unit.character_id.substr(5)}${itemList}, `;
    });
    return message;
});
exports.getMatch = getMatch;
const getStats = (streamer, nickname, server) => __awaiter(void 0, void 0, void 0, function* () {
    const [data] = yield (0, UserController_1.getUser)(streamer);
    let message = "";
    if (nickname) {
        const { response } = yield api.Summoner.getByName(nickname, server ? serverNameToServerId[server] : "EUW1");
        const userData = yield api.League.get(response.id, server ? serverNameToServerId[server] : "EUW1");
        const userInfo = userData.response[0];
        message = `statystyki gracza: ${response.name} | ${userInfo.tier}-${userInfo.rank} ${userInfo.leaguePoints}LP ${userInfo.wins}wins ${userInfo.wins + userInfo.loses}games`;
        return message;
    }
    else {
        const userData = yield api.League.get(data.activeRiotAccount.id, data.activeRiotAccount.server);
        const userInfo = userData.response[0];
        message = `statystyki gracza: ${data.activeRiotAccount.name} | ${userInfo.tier}-${userInfo.rank} ${userInfo.leaguePoints}LP ${userInfo.wins}wins ${userInfo.wins + userInfo.loses}games`;
        return message;
    }
});
exports.getStats = getStats;
const getLolStats = (streamer, nickname, server) => __awaiter(void 0, void 0, void 0, function* () {
    const [data] = yield (0, UserController_1.getUser)(streamer);
    let message = "";
    if (nickname) {
        const { response } = yield api.Summoner.getByName(nickname, server ? serverNameToServerId[server] : "EUW1");
        const userData = yield api.League.get(response.id, server ? serverNameToServerId[server] : "EUW1");
        const userInfo = userData.response[0];
        message = `statystyki gracza: ${response.name} | ${userInfo.tier}-${userInfo.rank} ${userInfo.leaguePoints}LP ${userInfo.wins}wins ${userInfo.wins + userInfo.loses}games`;
        return message;
    }
    else {
        const userData = yield api.League.get(data.activeRiotAccount.id, data.activeRiotAccount.server);
        const userInfo = userData.response[0];
        message = `statystyki gracza: ${data.activeRiotAccount.name} | ${userInfo.tier}-${userInfo.rank} ${userInfo.leaguePoints}LP ${userInfo.wins}wins ${userInfo.wins + userInfo.loses}games`;
        return message;
    }
});
exports.getLolStats = getLolStats;
const getRank = (streamer, server) => __awaiter(void 0, void 0, void 0, function* () {
    const { response: chall } = yield api.League.getChallengerLeague(server ? serverNameToServerId[server] : "EUW1");
    let message = "";
    let topRank = [];
    if (chall.entries.length > 10) {
        topRank = chall.entries.sort((a, b) => b.leaguePoints - a.leaguePoints).slice(0, 10);
    }
    else {
        topRank = chall.entries.sort((a, b) => b.leaguePoints - a.leaguePoints);
    }
    if (topRank.length !== 10) {
        const { response: grand } = yield api.League.getGrandMasterLeague(server ? serverNameToServerId[server] : "EUW1");
        if (grand.entries.length > 10 - topRank.length) {
            topRank = [
                ...topRank,
                ...grand.entries.sort((a, b) => b.leaguePoints - a.leaguePoints).slice(0, 10 - topRank.length),
            ];
        }
        else {
            topRank = [...topRank, ...grand.entries];
        }
    }
    if (topRank.length !== 10) {
        const { response: master } = yield api.League.getMasterLeague(server ? serverNameToServerId[server] : "EUW1");
        if (master.entries.length > 10 - topRank.length) {
            topRank = [
                ...topRank,
                ...master.entries.sort((a, b) => b.leaguePoints - a.leaguePoints).slice(0, 10 - topRank.length),
            ];
        }
        else {
            topRank = [...topRank, ...master.entries];
        }
    }
    const sortedTopRank = topRank.sort((a, b) => b.leaguePoints - a.leaguePoints);
    sortedTopRank.forEach((user, index) => {
        message = `${message} TOP${index + 1} ${user.summonerName} ${user.leaguePoints} LP, `;
    });
    return message;
});
exports.getRank = getRank;
const checkActiveRiotAccount = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const streamers = yield (0, UserController_1.getAllUser)();
        streamers.forEach((streamer) => __awaiter(void 0, void 0, void 0, function* () {
            if (streamer.riotAccountList && streamer.riotAccountList.length > 0) {
                streamer.riotAccountList.forEach(({ puuid, server, name, id }) => __awaiter(void 0, void 0, void 0, function* () {
                    var _f, _g, _h, _j, _k, _l, _m, _o, _p;
                    const lastMatch = yield api.Match.listWithDetails(puuid, region[server], { count: 1 });
                    let summonerName;
                    let lastMatchLol;
                    try {
                        summonerName = (yield apiLol.Summoner.getByName(name, server ? server : "EUW1")).response;
                    }
                    catch (err) { }
                    if (summonerName) {
                        const lastMatchLolId = (yield apiLol.MatchV5.list(summonerName.puuid, region[server], {
                            count: 1,
                        })).response;
                        if (lastMatchLolId.length > 0) {
                            try {
                                lastMatchLol = (yield apiLol.MatchV5.get(lastMatchLolId[0], region[server])).response;
                            }
                            catch (err) { }
                        }
                    }
                    const isLol = ((_f = lastMatchLol === null || lastMatchLol === void 0 ? void 0 : lastMatchLol.info) === null || _f === void 0 ? void 0 : _f.gameEndTimestamp) > ((_h = (_g = lastMatch[0]) === null || _g === void 0 ? void 0 : _g.info) === null || _h === void 0 ? void 0 : _h.game_datetime);
                    if (((_k = (_j = lastMatch[0]) === null || _j === void 0 ? void 0 : _j.info) === null || _k === void 0 ? void 0 : _k.game_datetime) > (streamer.activeRiotAccount ? streamer.activeRiotAccount.date : 0) ||
                        ((_l = lastMatchLol === null || lastMatchLol === void 0 ? void 0 : lastMatchLol.info) === null || _l === void 0 ? void 0 : _l.gameEndTimestamp) > (streamer.activeRiotAccount ? streamer.activeRiotAccount.date : 0)) {
                        yield (0, UserController_1.updateUser)({
                            streamer: streamer.streamer,
                            activeRiotAccount: {
                                name,
                                server,
                                puuid,
                                id,
                                isLol,
                                date: isLol ? (_m = lastMatchLol === null || lastMatchLol === void 0 ? void 0 : lastMatchLol.info) === null || _m === void 0 ? void 0 : _m.gameEndTimestamp : ((_p = (_o = lastMatch[0]) === null || _o === void 0 ? void 0 : _o.info) === null || _p === void 0 ? void 0 : _p.game_datetime) || "",
                            },
                        });
                    }
                }));
            }
        }));
    }
    catch ({ response }) {
        console.log(`Error while resetting last games in tft (${response.status} ${response.statusText})`);
    }
});
exports.checkActiveRiotAccount = checkActiveRiotAccount;
const serverNameToServerId = {
    EUW: "EUW1",
    EUNE: "EUN1",
    NA: "NA1",
    KR: "KR",
};
const lolPosition = {
    TOP: "TOP",
    JUNGLE: "JG",
    MIDDLE: "MID",
    BOTTOM: "ADC",
    SUPPORT: "SUP",
    UTILITY: "SUP",
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
    27: "ZZR",
};
//# sourceMappingURL=index.js.map