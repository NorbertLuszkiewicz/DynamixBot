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
exports.getLastGame = exports.getChessUser = void 0;
const chess_web_api_1 = __importDefault(require("chess-web-api"));
let chessAPI = new chess_web_api_1.default();
const getChessUser = (name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = yield chessAPI.getPlayer(name);
        const userStatsAllData = yield chessAPI.getPlayerStats(name);
        const userInfo = body;
        const userStats = userStatsAllData.body;
        const bulletData = userStats.chess_bullet ? `| BULLET: ${userStats.chess_bullet.last.rating}` : "";
        const blitzData = userStats.chess_blitz ? `| BLITZ: ${userStats.chess_blitz.last.rating}` : "";
        const rapidData = userStats.chess_rapid ? `| RAPID: ${userStats.chess_rapid.last.rating}` : "";
        const tacticsData = userStats.chess_bullet ? `| ZADANIA: najwyżej ${userStats.tactics.highest.rating}` : "";
        const bestRapidGame = userStats.chess_rapid && userStats.chess_rapid.best.game
            ? `| gra o najwyższy ranking rapid: ${userStats.chess_rapid.best.game}`
            : "";
        const userInfoToReturn = `staty: ${userInfo.username} ${rapidData} ${blitzData} ${bulletData} ${tacticsData} ${bestRapidGame}`;
        return userInfoToReturn;
    }
    catch (err) {
        console.log(`Error while getting chess player (${err})`);
    }
});
exports.getChessUser = getChessUser;
const getLastGame = (name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        let { body: { games }, } = yield chessAPI.getPlayerCompleteMonthlyArchives(name, now.getFullYear(), now.getMonth() + 1);
        const lastGame = games[games.length - 1];
        if (games.length === 0 && now.getMonth() !== 0) {
            games = yield chessAPI.getPlayerCompleteMonthlyArchives(name, now.getFullYear(), now.getMonth());
        }
        const lastGameResponse = games.length !== 0 ? `ostatnia gierka: ${lastGame.url}` : "niestety nie można wysłać ostatniej gry";
        return lastGameResponse;
    }
    catch (err) {
        console.log(`Error while getting chess last game (${err})`);
    }
});
exports.getLastGame = getLastGame;
//# sourceMappingURL=index.js.map