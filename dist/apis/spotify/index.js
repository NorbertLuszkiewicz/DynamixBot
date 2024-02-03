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
exports.refreshDevices = exports.lastPlaying = exports.currentlyPlaying = exports.refreshAccessToken = exports.setVolume = exports.changeVolumeOnTime = exports.nextSong = exports.pauseSong = exports.startSong = exports.addSpotify = exports.setTimeoutVolume = void 0;
const axios_1 = __importDefault(require("axios"));
const UserController_1 = require("../../controllers/UserController");
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const TOKEN = "https://accounts.spotify.com/api/token";
const PLAY = "https://api.spotify.com/v1/me/player/play";
const PAUSE = "https://api.spotify.com/v1/me/player/pause";
const NEXT = "https://api.spotify.com/v1/me/player/next";
const VOLUME = "https://api.spotify.com/v1/me/player/volume";
const PLAYER = "https://api.spotify.com/v1/me/player";
const DEVICES = "https://api.spotify.com/v1/me/player/devices";
let timeoutVolume = { kezman22: null, dynam1x1: null };
const getSpotifyHeader = (spotifyAccessToken) => {
    return {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${spotifyAccessToken}`,
        },
    };
};
const setTimeoutVolume = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allUsers = yield (0, UserController_1.getAllUser)();
        timeoutVolume = allUsers.reduce((acc, key) => (Object.assign(Object.assign({}, acc), { [key.streamer]: null })), {});
    }
    catch (_a) {
        console.log("Error when call setTimeoutVolume");
    }
});
exports.setTimeoutVolume = setTimeoutVolume;
const addSpotify = (streamer, code) => __awaiter(void 0, void 0, void 0, function* () {
    const body = `grant_type=authorization_code&code=${code}&redirect_uri=https://dynamix-bot.glitch.me/callback`;
    try {
        const { data } = yield axios_1.default.post(`${TOKEN}`, body, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(clientId + ":" + clientSecret).toString("base64")}`,
            },
        });
        yield (0, UserController_1.updateUser)({
            streamer: streamer,
            spotifyAccessToken: data.access_token,
            spotifyRefreshToken: data.refresh_token,
        });
        return { status: "success" };
    }
    catch (err) {
        console.log(`Error while getting first token (${err})`);
        return err;
    }
});
exports.addSpotify = addSpotify;
const startSong = (streamer) => __awaiter(void 0, void 0, void 0, function* () {
    const [user] = yield (0, UserController_1.getUser)(streamer);
    const { spotifyAccessToken, device } = user;
    try {
        return yield axios_1.default.put(`${PLAY}?device_id=${device}`, {}, getSpotifyHeader(spotifyAccessToken));
    }
    catch ({ response }) {
        console.log(`Error while starting song (${response.status} ${response.statusText})`);
    }
});
exports.startSong = startSong;
const pauseSong = (streamer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [user] = yield (0, UserController_1.getUser)(streamer);
        const { spotifyAccessToken, device } = user;
        return yield axios_1.default.put(`${PAUSE}?device_id=${device}`, {}, getSpotifyHeader(spotifyAccessToken));
    }
    catch ({ response }) {
        console.log(`Error while stopping song (${response.status} ${response.statusText})`);
    }
});
exports.pauseSong = pauseSong;
const nextSong = (streamer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [user] = yield (0, UserController_1.getUser)(streamer);
        const { spotifyAccessToken, device } = user;
        return yield axios_1.default.post(`${NEXT}?device_id=${device}`, {}, getSpotifyHeader(spotifyAccessToken));
    }
    catch ({ response }) {
        console.log(`Error while skipping song (${response.status} ${response.statusText})`);
    }
});
exports.nextSong = nextSong;
const changeVolumeOnTime = (streamer, min, max, time) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let [user] = yield (0, UserController_1.getUser)(streamer);
        let { spotifyAccessToken, device, maxVolumeTime } = user;
        let newMaxVolumeTime = 0;
        yield axios_1.default.put(`${VOLUME}?volume_percent=${max}&device_id=${device}`, {}, getSpotifyHeader(spotifyAccessToken));
        let now = Date.now();
        if (maxVolumeTime > now) {
            newMaxVolumeTime = maxVolumeTime + time;
        }
        else if (!maxVolumeTime || maxVolumeTime < now) {
            newMaxVolumeTime = now + time;
        }
        yield (0, UserController_1.updateUser)({
            streamer: streamer,
            maxVolumeTime: newMaxVolumeTime,
        });
        clearTimeout(timeoutVolume[streamer]);
        timeoutVolume[streamer] = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield axios_1.default.put(`${VOLUME}?volume_percent=${min}&device_id=${device}`, {}, getSpotifyHeader(spotifyAccessToken));
            }
            catch ({ response }) {
                console.log(`Error while volume changes to lower (${response.status} ${response.statusText})`);
            }
        }), newMaxVolumeTime - now, streamer);
    }
    catch ({ response }) {
        console.log(`Error while volume changes to higher (${response.data} )`);
    }
});
exports.changeVolumeOnTime = changeVolumeOnTime;
const setVolume = (streamer, value) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [user] = yield (0, UserController_1.getUser)(streamer);
        const { spotifyAccessToken, device } = user;
        return yield axios_1.default.put(`${VOLUME}?volume_percent=${value}&device_id=${device}`, {}, getSpotifyHeader(spotifyAccessToken));
    }
    catch ({ response }) {
        console.log(`Error while volume changes (${response.status} ${response.statusText})`);
    }
});
exports.setVolume = setVolume;
const refreshAccessToken = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const streamers = yield (0, UserController_1.getAllUser)();
        streamers.forEach((streamer) => __awaiter(void 0, void 0, void 0, function* () {
            if (streamer.streamer != "og1ii" && streamer.spotifyRefreshToken) {
                const body = `grant_type=refresh_token&refresh_token=${streamer.spotifyRefreshToken}&client_id=${clientId}`;
                const { data } = yield axios_1.default.post(`${TOKEN}`, body, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Authorization: `Basic ${Buffer.from(clientId + ":" + clientSecret).toString("base64")}`,
                    },
                });
                yield (0, UserController_1.updateUser)({
                    streamer: streamer.streamer,
                    spotifyAccessToken: data.access_token,
                    spotifyRefreshToken: data.refresh_token,
                });
            }
        }));
    }
    catch ({ response }) {
        console.log(`Error while resetting Spotify token (${response.status} ${response.statusText})`);
    }
});
exports.refreshAccessToken = refreshAccessToken;
const currentlyPlaying = (streamer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [user] = yield (0, UserController_1.getUser)(streamer);
        const { spotifyAccessToken } = user;
        const { data } = yield axios_1.default.get(`${PLAYER}?market=US`, getSpotifyHeader(spotifyAccessToken));
        return data;
    }
    catch ({ response }) {
        console.log(`Error while getting currently song (${response.status} ${response.statusText})`);
    }
});
exports.currentlyPlaying = currentlyPlaying;
const lastPlaying = (streamer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [user] = yield (0, UserController_1.getUser)(streamer);
        const { spotifyAccessToken } = user;
        const { data } = yield axios_1.default.get(`${PLAYER}/recently-played?limit=1`, getSpotifyHeader(spotifyAccessToken));
        return data === null || data === void 0 ? void 0 : data.items[0];
    }
    catch ({ response }) {
        console.log(`Error while getting last song (${response.status} ${response.statusText})`);
    }
});
exports.lastPlaying = lastPlaying;
const refreshDevices = (streamer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [user] = yield (0, UserController_1.getUser)(streamer);
        const { spotifyAccessToken } = user;
        const { data } = yield axios_1.default.get(DEVICES, getSpotifyHeader(spotifyAccessToken));
        console.log("devices: ", data);
        const device = data.devices.find(element => element.is_active)
            ? data.devices.find(element => element.is_active)
            : data.devices[0];
        yield (0, UserController_1.updateUser)({
            streamer: streamer,
            device: device.id,
        });
    }
    catch ({ response }) {
        console.log(`Error while getting devices (${response})`);
    }
});
exports.refreshDevices = refreshDevices;
//# sourceMappingURL=index.js.map