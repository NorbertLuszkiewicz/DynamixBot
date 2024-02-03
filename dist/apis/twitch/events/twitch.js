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
exports.getHoroscope = exports.getWeather = exports.getStreamerData = exports.refreshTwitchTokens = exports.addNewUser = void 0;
const axios_1 = __importDefault(require("axios"));
const UserController_1 = require("../../../controllers/UserController");
const TOKEN = "https://id.twitch.tv/oauth2/token";
const addNewUser = (code) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const body = `grant_type=authorization_code&code=${code}&redirect_uri=https://dynamix-bot.glitch.me/register&client_id=${process.env.BOT_CLIENT_ID}&client_secret=${process.env.BOT_CLIENT_SECRET}`;
    try {
        const { data } = yield axios_1.default.post(`${TOKEN}`, body, {});
        const users = yield (0, exports.getStreamerData)(data.access_token);
        const userName = (_b = (_a = users === null || users === void 0 ? void 0 : users.data) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.login;
        const userInDatabase = yield (0, UserController_1.getUser)(userName);
        if (userInDatabase.length === 0) {
            yield (0, UserController_1.addUser)({
                streamer: userName,
                twitchAccessToken: data.access_token,
                twitchRefreshToken: data.refresh_token,
            });
        }
        else {
            yield (0, UserController_1.updateUser)({
                streamer: userName,
                twitchAccessToken: data.access_token,
                twitchRefreshToken: data.refresh_token,
            });
        }
        return {
            status: "success",
            name: userName,
            token: data.access_token,
        };
    }
    catch (err) {
        console.log(`Error while getting first token (${err})`);
        return { status: "error" };
    }
});
exports.addNewUser = addNewUser;
const refreshTwitchTokens = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const streamers = yield (0, UserController_1.getAllUser)();
        streamers.forEach((streamer) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                if (streamer.twitchAccessToken) {
                    const body = `grant_type=refresh_token&refresh_token=${encodeURIComponent(streamer.twitchRefreshToken)}&client_id=${process.env.BOT_CLIENT_ID}&client_secret=${process.env.BOT_CLIENT_SECRET}`;
                    const { data } = yield axios_1.default.post(`${TOKEN}`, body, {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                    });
                    yield (0, UserController_1.updateUser)({
                        streamer: streamer.streamer,
                        twitchAccessToken: data.access_token,
                        twitchRefreshToken: data.refresh_token,
                    });
                }
            }
            catch (err) {
                console.log("RefreshToken Twitch error", streamer.streamer);
            }
        }));
        console.log("reset twitch token");
    }
    catch (err) {
        console.log(`Error while refreshing twitch tokens ${err.data}`);
    }
});
exports.refreshTwitchTokens = refreshTwitchTokens;
const getStreamerData = (accessToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.get("https://api.twitch.tv/helix/users", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Client-Id": process.env.BOT_CLIENT_ID,
            },
        });
        return data;
    }
    catch (err) {
        console.log(`Error while getting streamer data ${err}`);
    }
});
exports.getStreamerData = getStreamerData;
const getWeather = (city) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&lang=pl&appid=${process.env.WEATHER_TOKEN}`);
        return {
            temp: data.main.temp,
            speed: data.wind.speed,
            description: data.weather[0].description,
        };
    }
    catch (err) {
        console.log(`Error while getting weather ${err}`);
    }
});
exports.getWeather = getWeather;
const getHoroscope = (sign) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.post(`https://aztro.sameerkumar.website/?sign=${sign}&day=today`);
        return data.description;
    }
    catch (err) {
        console.log(`Error while getting horoscope ${err}`);
    }
});
exports.getHoroscope = getHoroscope;
//# sourceMappingURL=twitch.js.map