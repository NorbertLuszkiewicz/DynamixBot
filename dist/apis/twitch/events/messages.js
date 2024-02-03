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
exports.messages = exports.setTimeoutVolume = void 0;
const comfy_js_1 = __importDefault(require("comfy.js"));
const spotify_1 = require("../../spotify");
const UserController_1 = require("../../../controllers/UserController");
const streamElements_1 = require("../../streamElements");
const helpers_1 = require("../../../helpers");
const helix_1 = require("./helix");
let timeoutVolume = {};
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
const messages = () => {
    comfy_js_1.default.onChat = (user, message, flags, self, extra) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const [data] = yield (0, UserController_1.getUser)(extra.channel);
            const { addSongID, skipSongID, volumeSongID, rollID, banID, slotsID } = yield data;
            if (flags.customReward && message === "add-song-award" && (flags.mod || flags.broadcaster)) {
                (0, UserController_1.updateUser)({
                    streamer: extra.channel,
                    addSongID: extra.customRewardId,
                });
                comfy_js_1.default.Say("Włączono automatyczne dodawanie piosenki przy zakupie tej nagrody", extra.channel);
            }
            if (flags.customReward && message === "skip-song-award" && (flags.mod || flags.broadcaster)) {
                (0, UserController_1.updateUser)({
                    streamer: extra.channel,
                    skipSongID: extra.customRewardId,
                });
                comfy_js_1.default.Say("Włączono automatyczne pomijanie piosenki przy zakupie tej nagrody", extra.channel);
            }
            if (flags.customReward && message === "change-volume-song-award" && (flags.mod || flags.broadcaster)) {
                const newVolumeSongID = volumeSongID;
                newVolumeSongID.id = extra.customRewardId;
                (0, UserController_1.updateUser)({
                    streamer: extra.channel,
                    volumeSongID: newVolumeSongID,
                });
                comfy_js_1.default.Say("Włączono automatyczą zmiane głosności przy zakupie tej nagrody", extra.channel);
            }
            const slots = slotsID.find(slots => slots.name.toLowerCase() === message.toLowerCase());
            if (flags.customReward && slots && (flags.mod || flags.broadcaster)) {
                const updateSlots = slotsID.map(item => {
                    if (item.name.toLowerCase() === slots.name.toLowerCase()) {
                        item.id = extra.customRewardId;
                    }
                    return item;
                });
                (0, UserController_1.updateUser)({
                    streamer: extra.channel,
                    slotsID: updateSlots,
                });
                comfy_js_1.default.Say(`Włączono Slots dla nagrody "${slots.name}"`, extra.channel);
            }
            if (flags.customReward && extra.customRewardId === addSongID) {
                comfy_js_1.default.Say("!sr " + (0, helpers_1.changeBadWords)(message), extra.channel);
            }
            if (flags.customReward && extra.customRewardId === rollID) {
                comfy_js_1.default.Say(`${user} rolls the dice and gets a ${randomIntFromInterval(1, 420)}!`, extra.channel);
            }
            if (flags.customReward && extra.customRewardId === banID) {
                let number = randomIntFromInterval(1, 100);
                if (number == 1) {
                    (0, helix_1.timeout)(user, 1, "t/o z nagrody kanału", extra.channel);
                    comfy_js_1.default.Say(`${user} brawo trafiłeś w 1% na 10s t/o OOOO`, extra.channel);
                }
                if (number > 1 && number < 89) {
                    comfy_js_1.default.Say(`${user} brawo trafiłeś w 88% na 30min t/0 PeepoGlad`, extra.channel);
                    (0, helix_1.timeout)(user, 1800, "t/o z nagrody kanału", extra.channel);
                }
                if (number > 88 && number < 100) {
                    comfy_js_1.default.Say(`${user} brawo trafiłeś w 10% na 1h t/0 EZ`, extra.channel);
                    (0, helix_1.timeout)(user, 3600, "t/o z nagrody kanału", extra.channel);
                }
                if (number == 100) {
                    comfy_js_1.default.Say(`${user} brawo trafiłeś w 1% na perma KEKW`, extra.channel);
                    (0, helix_1.timeout)(user, null, "t/o z nagrody kanału", extra.channel);
                }
            }
            let reward = slotsID.find(slots => slots.id === extra.customRewardId);
            if (flags.customReward && reward) {
                const emotes = [
                    "",
                    "VisLaud",
                    "EZ",
                    "peepoGlad",
                    "Kappa",
                    "okok",
                    "BOOBA",
                    "kezmanStare",
                    "catJAM",
                    "SUSSY",
                    "OOOO",
                    "BRUHBRUH",
                    "overD",
                    "zyzzBass",
                    "LIKE",
                    "Sadge",
                ];
                const maxNumber = reward ? reward.emotes : 7;
                let number1 = randomInt(1, maxNumber);
                let number2 = randomInt(1, maxNumber);
                let number3 = randomInt(1, maxNumber);
                if (reward.id == "2ac9a80d-9891-492a-b803-d55616873244") {
                    number3 = number2;
                }
                let result = `____________________PREMIUM____________________
      ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀[ ${emotes[number1]} | ${emotes[number2]} | ${emotes[number3]} ]/
      __________________________________________________
      `;
                const isWin = number1 === number2 && number2 === number3;
                const isSemiWin = number1 === number2 || number1 === number3 || number2 === number3;
                let winMessage = "przegrałeś PepeLaugh";
                isSemiWin && (winMessage = "prawie prawie PauseChamp");
                isWin && (winMessage = "wygrałeś BRUHBRUH @" + extra.channel);
                comfy_js_1.default.Say(`${result} @${user} ${winMessage}`, extra.channel);
                if (!isWin && reward.id == "2ac9a80d-9891-492a-b803-d55616873244") {
                    (0, helix_1.timeout)(user, 600, "t/o z nagrody kanału", extra.channel);
                }
                else if (isWin && reward.id == "2ac9a80d-9891-492a-b803-d55616873244") {
                    (0, helix_1.timeout)(message, 600, "t/o z nagrody kanału", extra.channel);
                }
                else if (reward.withBan && !isWin) {
                    if (!isSemiWin && maxNumber > 3) {
                        (0, helix_1.timeout)(user, 600, "t/o z nagrody kanału", extra.channel);
                    }
                    if (isSemiWin && maxNumber <= 3) {
                        (0, helix_1.timeout)(user, 600, "t/o z nagrody kanału", extra.channel);
                    }
                    if (isSemiWin && maxNumber > 3 && extra.channel.toLowerCase() === "kezman22") {
                        (0, helix_1.timeout)(user, 600, "t/o z nagrody kanału", extra.channel);
                    }
                }
                let slitsIDChanged = slotsID.map(item => {
                    if (item.id === reward.id) {
                        item.times += 1;
                        if (isWin) {
                            item.wins += 1;
                            if (item.lastWinners) {
                                item.lastWinners.push(user);
                                item.lastWinners.length > 3 && item.lastWinners.splice(0, 1);
                            }
                            else {
                                item.lastWinners = [user];
                            }
                        }
                    }
                    return item;
                });
                (0, UserController_1.updateUser)({
                    streamer: extra.channel,
                    slotsID: slitsIDChanged,
                });
            }
            if (user === "StreamElements" &&
                (message.lastIndexOf("to the queue") != -1 || message.lastIndexOf("do kolejki") != -1)) {
                if (extra.channel !== "overpow") {
                    (0, spotify_1.pauseSong)(extra.channel);
                }
                const removedSongList = yield (0, streamElements_1.removeBlockedSong)(extra.channel);
                if (removedSongList.length > 0) {
                    removedSongList.forEach(x => {
                        comfy_js_1.default.Say(`@${(0, helpers_1.changeBadWords)(x.user)} ${(0, helpers_1.changeBadWords)(x.title)} | ${x.reason}`, extra.channel);
                    });
                }
            }
            if (flags.customReward && extra.customRewardId === skipSongID) {
                const spotifyData = yield (0, spotify_1.currentlyPlaying)(extra.channel);
                if (spotifyData === null || spotifyData === void 0 ? void 0 : spotifyData.is_playing) {
                    (0, spotify_1.nextSong)(extra.channel);
                }
                else {
                    comfy_js_1.default.Say("!skip", extra.channel);
                    yield (0, streamElements_1.timeRequest)(extra.channel, "skip");
                }
            }
            const { id, min, max, minSR, maxSR, time } = volumeSongID
                ? volumeSongID
                : {
                    id: null,
                    min: null,
                    max: null,
                    minSR: null,
                    maxSR: null,
                    time: null,
                };
            if (volumeSongID && flags.customReward && extra.customRewardId === id) {
                comfy_js_1.default.Say("!volume " + maxSR, extra.channel);
                (0, spotify_1.changeVolumeOnTime)(extra.channel, min, max, time);
                let [user] = yield (0, UserController_1.getUser)(extra.channel);
                let newMaxVolumeTime = 0;
                let now = Date.now();
                if (user.maxVolumeTime > now) {
                    newMaxVolumeTime = user.maxVolumeTime + time;
                }
                if (!user.maxVolumeTime || user.maxVolumeTime < now) {
                    newMaxVolumeTime = now + time;
                }
                yield (0, UserController_1.updateUser)({
                    streamer: extra.channel,
                    maxVolumeTime: newMaxVolumeTime,
                });
                clearTimeout(timeoutVolume[extra.channel]);
                timeoutVolume[extra.channel] = setTimeout(() => {
                    comfy_js_1.default.Say("!volume " + minSR, extra.channel);
                }, newMaxVolumeTime - now);
            }
            if (message == "skip" && user === "DynaM1X1") {
                try {
                    const spotifyData = yield (0, spotify_1.currentlyPlaying)(extra.channel);
                    if (spotifyData === null || spotifyData === void 0 ? void 0 : spotifyData.is_playing) {
                        (0, spotify_1.nextSong)(extra.channel);
                    }
                    else {
                        comfy_js_1.default.Say("!skip", extra.channel);
                        yield (0, streamElements_1.timeRequest)(extra.channel, "skip");
                    }
                }
                catch (err) {
                    console.log(`Error when skip song ${err}`);
                }
            }
        }
        catch (err) {
            console.log(`Error when use message ${err}`);
        }
        if (message === "pause" && user === "DynaM1X1") {
            (0, spotify_1.pauseSong)(extra.channel);
        }
        if (message === "device" && user === "DynaM1X1") {
            (0, spotify_1.refreshDevices)(extra.channel);
        }
        if ((message.indexOf("gun l2plelTosia") !== -1 || message.indexOf("Gun l2plelTosia") !== -1) &&
            user != "DynaM1X1" &&
            user != "StreamElements") {
            comfy_js_1.default.Say(`l2plelTosia overGun ${user}`, extra.channel);
            (0, helix_1.timeout)(user, 60, "strzelał do tosi", extra.channel);
        }
        // volume [value] command
        const isVolumeCommand = message.lastIndexOf("volume");
        const volumeValue = message.substr(7);
        if (isVolumeCommand == 0 && (flags.mod || flags.broadcaster)) {
            console.log(extra.channel, volumeValue);
            (0, spotify_1.setVolume)(extra.channel, volumeValue);
        }
        // piramidka [emote] command
        const isPriamidka = message.lastIndexOf("piramidka");
        let emote = message.substr(9);
        !emote && (emote = "catJAM ");
        if (isPriamidka == 0 && message.length < 30 && (flags.mod || flags.broadcaster)) {
            comfy_js_1.default.Say(emote + " ", extra.channel);
            comfy_js_1.default.Say(emote + " " + emote + " ", extra.channel);
            comfy_js_1.default.Say(emote + " " + emote + " " + emote + " ", extra.channel);
            comfy_js_1.default.Say(emote + " " + emote + " " + emote + " " + emote + " ", extra.channel);
            comfy_js_1.default.Say(emote + " " + emote + " " + emote + " ", extra.channel);
            comfy_js_1.default.Say(emote + " " + emote + " ", extra.channel);
            comfy_js_1.default.Say(emote + " ", extra.channel);
        }
        extra.customRewardId && console.log(extra.customRewardId, extra.channel);
    });
};
exports.messages = messages;
function randomInt(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function randomIntFromInterval(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}
//# sourceMappingURL=messages.js.map