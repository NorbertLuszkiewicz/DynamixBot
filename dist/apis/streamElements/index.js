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
exports.removeBlockedSong = exports.timeRequest = exports.getHistorySR = exports.setSongAsPlay = exports.lastSongPlaying = exports.songPlayingNow = exports.getSpotifyAreaData = exports.setTimeoutVolume = void 0;
const axios_1 = __importDefault(require("axios"));
const spotify_1 = require("../spotify");
const youtube_1 = require("../youtube");
const UserController_1 = require("../../controllers/UserController");
const url = "https://api.streamelements.com/kappa/v2/";
let timeoutVolume = {};
const getSongRequestHeader = (clientSongRequestSecret, contentType) => {
    return {
        headers: {
            Authorization: `Bearer ${clientSongRequestSecret}`,
            "Content-Type": contentType ? contentType : "application/json",
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
const getSpotifyAreaData = (streamer, area) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [user] = yield (0, UserController_1.getUser)(streamer);
        const { clientSongRequestID, clientSongRequestSecret } = user;
        const { data } = yield axios_1.default.get(`${url}songrequest/${clientSongRequestID}/${area}`, getSongRequestHeader(clientSongRequestSecret));
        return data;
    }
    catch ({ response }) {
        console.log(`Error while getting ${area} (${response.status} ${response.statusText})`);
    }
});
exports.getSpotifyAreaData = getSpotifyAreaData;
const songPlayingNow = (streamer) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const player = yield (0, exports.getSpotifyAreaData)(streamer, "player");
        const playing = yield (0, exports.getSpotifyAreaData)(streamer, "playing");
        return {
            isPlayingNow: player.state == "playing" && playing != null,
            title: playing && playing.title,
            link: playing && `https://www.youtube.com/watch?v=${playing.videoId ? playing.videoId : playing.song.videoId}`,
            userAdded: (_b = playing === null || playing === void 0 ? void 0 : playing.user) === null || _b === void 0 ? void 0 : _b.username,
        };
    }
    catch (err) {
        console.log(`Error while checking what song playing now ${err}`);
    }
});
exports.songPlayingNow = songPlayingNow;
const lastSongPlaying = (streamer) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    try {
        const player = yield (0, exports.getSpotifyAreaData)(streamer, "player");
        const playing = yield (0, exports.getSpotifyAreaData)(streamer, "playing");
        const [user] = yield (0, UserController_1.getUser)(streamer);
        const { clientSongRequestID, clientSongRequestSecret } = user;
        const history = yield (0, exports.getHistorySR)(clientSongRequestID, clientSongRequestSecret, 1, 0);
        return {
            isPlayingNow: player.state == "playing" && playing != null,
            title: history && history[0].song.title,
            link: history && `https://www.youtube.com/watch?v=${history[0].song.videoId}`,
            userAdded: (_d = (_c = history[0].song) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.username,
        };
    }
    catch (err) {
        console.log(`Error while checking what last song streamelemets ${err}`);
    }
});
exports.lastSongPlaying = lastSongPlaying;
const setSongAsPlay = (streamer, state) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [user] = yield (0, UserController_1.getUser)(streamer);
        const { clientSongRequestID, clientSongRequestSecret } = user;
        yield axios_1.default.post(`${url}songrequest/${clientSongRequestID}/player/${state}`, {}, getSongRequestHeader(clientSongRequestSecret, "application/x-www-form-urlencoded"));
    }
    catch ({ response }) {
        console.log(`Error while setSongAsPlay (${response.status} ${response.statusText})`);
    }
});
exports.setSongAsPlay = setSongAsPlay;
const getHistorySR = (clientSongRequestID, clientSongRequestSecret, limit = 100, offset = 0) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.get(`${url}songrequest/${clientSongRequestID}/history?limit=${limit}&offset=${offset}`, getSongRequestHeader(clientSongRequestSecret));
        return data === null || data === void 0 ? void 0 : data.history;
    }
    catch ({ response }) {
        console.log(`Error while getHistorySR (${response.status} ${response.statusText})`);
    }
});
exports.getHistorySR = getHistorySR;
const timeRequest = (streamer, action) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let playing = yield (0, exports.getSpotifyAreaData)(streamer, "playing");
        const queue = yield (0, exports.getSpotifyAreaData)(streamer, "queue");
        const [user] = yield (0, UserController_1.getUser)(streamer);
        const { endTime } = user;
        let now = Date.now();
        if (action === "add") {
            let newEndTime;
            if ((playing && playing.duration && queue.length == 0) || (!playing && queue.length == 1)) {
                newEndTime = playing.duration * 1000;
            }
            if (playing && queue.length > 0) {
                if (endTime > now) {
                    newEndTime = endTime - now + queue[queue.length - 1].duration * 1000;
                }
                else {
                    let allQueueTimes = 0;
                    queue.forEach(song => (allQueueTimes += song.duration));
                    newEndTime = (allQueueTimes + playing.duration) * 1000;
                }
            }
            yield (0, UserController_1.updateUser)({
                streamer: streamer,
                endTime: newEndTime + now,
            });
            clearTimeout(timeoutVolume[streamer]);
            timeoutVolume[streamer] = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                playing = yield (0, exports.getSpotifyAreaData)(streamer, "playing");
                if (!playing)
                    (0, spotify_1.startSong)(streamer);
            }), newEndTime + 1 * (queue.length + 1));
        }
        if (action === "skip") {
            if (playing) {
                let timeOfSongsInQueue = 0;
                queue.length > 0 ? queue.forEach(song => (timeOfSongsInQueue += song.duration)) : (timeOfSongsInQueue = 0);
                const timeOfAllSongs = (playing.duration + timeOfSongsInQueue) * 1000;
                yield (0, UserController_1.updateUser)({
                    streamer: streamer,
                    endTime: timeOfAllSongs + now,
                });
                clearTimeout(timeoutVolume[streamer]);
                timeoutVolume[streamer] = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                    playing = yield (0, exports.getSpotifyAreaData)(streamer, "playing");
                    !playing && (0, spotify_1.startSong)(streamer);
                }), timeOfAllSongs + 1000 * (queue.length + 1));
            }
            else {
                (0, spotify_1.startSong)(streamer);
            }
        }
    }
    catch (err) {
        console.log(`Error while changging volume on time ${err}`);
    }
});
exports.timeRequest = timeRequest;
const removeBlockedSong = (streamer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const removedSongList = [];
        const [user] = yield (0, UserController_1.getUser)(streamer);
        const { clientSongRequestID, clientSongRequestSecret } = user;
        const queue = yield (0, exports.getSpotifyAreaData)(streamer, "queue");
        const playing = yield (0, exports.getSpotifyAreaData)(streamer, "playing");
        const removeSong = song => axios_1.default.delete(`${url}songrequest/${clientSongRequestID}/queue/${song}`, getSongRequestHeader(clientSongRequestSecret));
        if (queue.length > 0) {
            queue.forEach((song) => __awaiter(void 0, void 0, void 0, function* () {
                const isBlocked = yield (0, youtube_1.isBlockedVideo)(null, streamer, song.videoId);
                if (!isBlocked.isVideo || isBlocked.isBlocked) {
                    removeSong(song._id);
                    removedSongList.push({
                        user: song.user.username,
                        title: song.title,
                        reason: "usunięto z kolejki: ta piosenka jest zablokowana przez yt",
                    });
                }
            }));
        }
        if (playing) {
            const isBlocked = yield (0, youtube_1.isBlockedVideo)(null, streamer, playing.videoId);
            if (!isBlocked.isVideo || isBlocked.isBlocked) {
                removeSong(playing._id);
                removedSongList.push({
                    user: playing.user.username,
                    title: playing.title,
                    reason: "usunięto z kolejki: ta piosenka jest zablokowana przez yt",
                });
            }
        }
        //for overpow for now changed global in the future
        if (streamer.toLowerCase() === "overpow") {
            const historyList = [];
            const fistPage = yield (0, exports.getHistorySR)(clientSongRequestID, clientSongRequestSecret, 100, 0);
            const secondPage = yield (0, exports.getHistorySR)(clientSongRequestID, clientSongRequestSecret, 100, 100);
            fistPage.forEach(x => historyList.push(x.song.videoId));
            secondPage.forEach(x => historyList.push(x.song.videoId));
            queue.slice(-2).forEach((song) => __awaiter(void 0, void 0, void 0, function* () {
                if (song.source !== "tip") {
                    if (historyList.find(x => x === song.videoId)) {
                        removeSong(song._id);
                        removedSongList.push({
                            user: song.user.username,
                            title: song.title,
                            reason: "usunięto z kolejki: ten utwór był niedawno puszczany",
                        });
                    }
                    if (queue.length > 2) {
                        const queueVideoIdList = queue.slice(0, -2).map(x => x.videoId);
                        if (queueVideoIdList.find(x => x === song.videoId)) {
                            removeSong(song._id);
                            removedSongList.push({
                                user: song.user.username,
                                title: song.title,
                                reason: "usunięto z kolejki: ten utwór jest już w kolejce",
                            });
                        }
                    }
                }
            }));
        }
        return removedSongList;
    }
    catch (err) {
        console.log(`Error while checking what song playing now delete usless songs ${err}`);
    }
});
exports.removeBlockedSong = removeBlockedSong;
//# sourceMappingURL=index.js.map