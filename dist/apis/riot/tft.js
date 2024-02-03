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
exports.getRank = exports.getStats = exports.getMatch = exports.tftMatchList = exports.removeTftUser = exports.addTftUser = exports.resetRiotName = void 0;
const twisted_1 = require("twisted");
const UserController_1 = require("../../controllers/UserController");
const helpers_1 = require("../../helpers");
const api = new twisted_1.TftApi();
const apiLol = new twisted_1.LolApi({
    key: process.env.RIOT_API_KEY_LOL,
});
const getTftUserStatsText = (name, userInfo) => {
    return `statystyki TFT dla gracza: ${name} | ${userInfo.tier}-${userInfo.rank} ${userInfo.leaguePoints}LP ${userInfo.wins}wins ${userInfo.wins + userInfo.losses}games`;
};
const getSortedTftMatchData = (traits, units) => {
    const sortedTraits = traits.filter(trait => trait.tier_current > 0).sort((a, b) => b.num_units - a.num_units);
    const sortedUnits = units
        .sort((a, b) => b.rarity - a.rarity)
        .sort((a, b) => b.tier - a.tier)
        .sort((a, b) => { var _a, _b; return ((_a = b.itemNames) === null || _a === void 0 ? void 0 : _a.length) - ((_b = a.itemNames) === null || _b === void 0 ? void 0 : _b.length); });
    return { sortedTraits, sortedUnits };
};
const createTftMatchText = (placement, level, augments, sortedTraits, sortedUnits) => {
    let message = `[Top${placement}] Level: ${level} | `;
    sortedTraits.forEach(trait => {
        const traitNameWithoutSet = trait.name.substr(trait.name.lastIndexOf("_") + 1);
        message = message + `${traitNameWithoutSet}*${trait.num_units}, `;
    });
    message = message + `| ${augments} `;
    message = message + "___________________________________________________";
    sortedUnits.forEach(unit => {
        let itemList = "";
        if (unit.itemNames.length > 0) {
            const items = unit.itemNames
                .map(item => {
                const itemNameWithoutSet = item.substr(item.lastIndexOf("_") + 1);
                const UpperLetters = itemNameWithoutSet.replace(/[a-z]/g, "");
                const result = UpperLetters.length > 1 ? UpperLetters : itemNameWithoutSet.trim().substring(0, 5);
                return result;
            })
                .filter(x => x);
            itemList = `[${items}]`;
        }
        const augmentNameWithoutSet = unit.character_id.substr(unit.character_id.lastIndexOf("_") + 1);
        message = message + `${unit.tier}*${augmentNameWithoutSet}${itemList}, `;
    });
    return message;
};
const resetRiotName = (streamer) => __awaiter(void 0, void 0, void 0, function* () {
    const [data] = yield (0, UserController_1.getUser)(streamer);
    const riotAccountList = data.riotAccountList;
    const newRiotAccountList = yield Promise.all(riotAccountList.map((account) => __awaiter(void 0, void 0, void 0, function* () {
        const { response } = yield api.Summoner.getByName(account.puuid, account.server);
        return Object.assign(Object.assign({}, account), { name: response.name });
    })));
    yield (0, UserController_1.updateUser)({
        streamer: data.streamer,
        riotAccountList: newRiotAccountList,
    });
});
exports.resetRiotName = resetRiotName;
const addTftUser = (name, server, streamer) => __awaiter(void 0, void 0, void 0, function* () {
    const [data] = yield (0, UserController_1.getUser)(streamer);
    const existThisAccount = data.riotAccountList.find(riotAccount => riotAccount.name === name && riotAccount.server === server);
    if (!existThisAccount) {
        const { response } = yield api.Summoner.getByName(name, server);
        const lol = yield apiLol.Summoner.getByName(name, server);
        const newRiotAccountList = data.riotAccountList
            ? [
                ...data.riotAccountList,
                {
                    name,
                    server,
                    puuid: response.puuid,
                    id: response.id,
                    lol_puuid: lol.response.puuid,
                    lol_id: lol.response.id,
                },
            ]
            : [
                {
                    name,
                    server,
                    puuid: response.puuid,
                    id: response.id,
                    lol_puuid: lol.response.puuid,
                    lol_id: lol.response.id,
                },
            ];
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
    try {
        if (nickname) {
            const { response } = yield api.Summoner.getByName(nickname, server ? helpers_1.serverNameToServerId[server] : "EUW1");
            matchList = yield api.Match.listWithDetails(response.puuid, server ? helpers_1.region[helpers_1.serverNameToServerId[server]] : "EUROPE", { count: 10 });
            puuid = response.puuid;
        }
        else {
            matchList = yield api.Match.listWithDetails(data.activeRiotAccount.puuid, helpers_1.region[data.activeRiotAccount.server], {
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
        return `${nickname ? nickname : streamer} nie zagrał dzisiaj żadnej gry w TFT`;
    }
    catch (err) {
        console.log("Error while getting tft matches stats" + err);
        const message = `Nie znaleziono meczy TFT z dzisiaj dla ${nickname ? nickname + "#" + (server || "EUW") : `streamera`}`;
        return message;
    }
});
exports.tftMatchList = tftMatchList;
const getMatch = (number, nickname, server, streamer) => __awaiter(void 0, void 0, void 0, function* () {
    if (!number) {
        return "@${user} komenda !mecze pokazuje liste meczy z dzisiaj (miejsca o raz synergie) !mecz [nr] gdzie [nr] oznacza numer meczu licząc od najnowszego czyli !mecz 1 pokaze ostatnią gre (wyświetla dokładny com z itemami i synergiami)";
    }
    try {
        const [data] = yield (0, UserController_1.getUser)(streamer);
        let puuid = data.activeRiotAccount.puuid;
        let gameRegion = nickname ? "EUROPE" : helpers_1.region[data.activeRiotAccount.server];
        if (nickname) {
            const summoner = yield api.Summoner.getByName(nickname, server ? helpers_1.serverNameToServerId[server] : "EUW1");
            gameRegion = server ? helpers_1.region[helpers_1.serverNameToServerId[server]] : "EUROPE";
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
            const augmentNameWithoutSet = augment.substr(augment.lastIndexOf("_") + 1).replace(/([A-Z])/g, " $1");
            augments.push(augmentNameWithoutSet.charAt(0).toUpperCase() + augmentNameWithoutSet.slice(1));
        });
        const { sortedTraits, sortedUnits } = getSortedTftMatchData(myBoard.traits, myBoard.units);
        const message = createTftMatchText(myBoard.placement, myBoard.level, augments, sortedTraits, sortedUnits);
        return message;
    }
    catch (err) {
        console.log("Error while getting tft user stats" + err);
        const message = `Nie znaleziono meczu TFT dla ${nickname ? nickname + "#" + (server || "EUW") : `streamera`}`;
        return message;
    }
});
exports.getMatch = getMatch;
const getStats = (streamer, nickname, server) => __awaiter(void 0, void 0, void 0, function* () {
    const [data] = yield (0, UserController_1.getUser)(streamer);
    const tftRegion = server ? helpers_1.serverNameToServerId[server] : "EUW1";
    let message = "";
    try {
        if (nickname) {
            const { response } = yield api.Summoner.getByName(nickname, tftRegion);
            const userData = yield api.League.get(response.id, tftRegion);
            const userInfo = userData.response[0];
            message = getTftUserStatsText(response.name, userInfo);
            return message;
        }
        else {
            const userData = yield api.League.get(data.activeRiotAccount.id, data.activeRiotAccount.server);
            const userInfo = userData.response[0];
            message = getTftUserStatsText(data.activeRiotAccount.name, userInfo);
            return message;
        }
    }
    catch (err) {
        console.log("Error while getting tft user stats" + err);
        message = `Nie znaleziono statystyk TFT dla ${nickname ? nickname + "#" + (server || "EUW") : `streamera`}`;
        return message;
    }
});
exports.getStats = getStats;
const getRank = (server) => __awaiter(void 0, void 0, void 0, function* () {
    const { response: chall } = yield api.League.getChallengerLeague(server ? helpers_1.serverNameToServerId[server] : "EUW1");
    let message = "";
    let topRank = [];
    if (chall.entries.length > 10) {
        topRank = chall.entries.sort((a, b) => b.leaguePoints - a.leaguePoints).slice(0, 10);
    }
    else {
        topRank = chall.entries.sort((a, b) => b.leaguePoints - a.leaguePoints);
    }
    if (topRank.length !== 10) {
        const { response: grand } = yield api.League.getGrandMasterLeague(server ? helpers_1.serverNameToServerId[server] : "EUW1");
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
        const { response: master } = yield api.League.getMasterLeague(server ? helpers_1.serverNameToServerId[server] : "EUW1");
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
//# sourceMappingURL=tft.js.map