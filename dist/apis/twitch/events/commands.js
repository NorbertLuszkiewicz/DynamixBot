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
exports.commands = void 0;
const comfy_js_1 = __importDefault(require("comfy.js"));
const twitch_1 = require("./twitch");
const helpers_1 = require("../../../helpers");
const helix_1 = require("./helix");
const lol_1 = require("../../riot/lol");
const tft_1 = require("../../riot/tft");
const spotify_1 = require("../../spotify");
const streamElements_1 = require("../../streamElements");
const chess_1 = require("../../chess");
const literalnie_1 = require("../../literalnie");
const UserController_1 = require("../../../controllers/UserController");
const helpers_2 = require("../../../helpers");
let users = {};
let usersWordle = {};
const commands = () => (comfy_js_1.default.onCommand = (user, command, message, flags, extra) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    try {
        const [data] = yield (0, UserController_1.getUser)(extra.channel);
        const { commandSwitch, addSongID } = yield data;
        if ((command == "song" || command == "coleci") && commandSwitch.song) {
            try {
                const spotifyData = yield (0, spotify_1.currentlyPlaying)(extra.channel);
                const { title, link, userAdded } = yield (0, streamElements_1.songPlayingNow)(extra.channel);
                if (spotifyData === null || spotifyData === void 0 ? void 0 : spotifyData.is_playing) {
                    comfy_js_1.default.Say(`@${user} ${title} ${userAdded && " | dodał/a " + userAdded + " "} ${link} `, extra.channel);
                }
                else {
                    let url = ((_b = (_a = spotifyData === null || spotifyData === void 0 ? void 0 : spotifyData.item) === null || _a === void 0 ? void 0 : _a.external_urls) === null || _b === void 0 ? void 0 : _b.spotify) ? (_d = (_c = spotifyData === null || spotifyData === void 0 ? void 0 : spotifyData.item) === null || _c === void 0 ? void 0 : _c.external_urls) === null || _d === void 0 ? void 0 : _d.spotify : "";
                    let title = ((_e = spotifyData === null || spotifyData === void 0 ? void 0 : spotifyData.item) === null || _e === void 0 ? void 0 : _e.name) ? (_f = spotifyData === null || spotifyData === void 0 ? void 0 : spotifyData.item) === null || _f === void 0 ? void 0 : _f.name : "Nieznany tytuł utworu";
                    let autor = "";
                    if (((_h = (_g = spotifyData.item) === null || _g === void 0 ? void 0 : _g.artists) === null || _h === void 0 ? void 0 : _h.length) > 0) {
                        (_k = (_j = spotifyData.item) === null || _j === void 0 ? void 0 : _j.artists) === null || _k === void 0 ? void 0 : _k.forEach(artist => {
                            autor += artist.name + ", ";
                        });
                    }
                    spotifyData && comfy_js_1.default.Say(`@${user} ${title} | ${autor} ${url}`, extra.channel);
                }
            }
            catch (err) {
                console.log(`Error when use !song on twitch (${err})`);
            }
        }
        if (flags.customReward && extra.customRewardId === addSongID) {
            comfy_js_1.default.Say("!sr " + (0, helpers_1.changeBadWords)(message), extra.channel);
        }
        if (command == "lastsong" && commandSwitch.song) {
            try {
                const lastPlayingSpotify = yield (0, spotify_1.lastPlaying)(extra.channel);
                const { isPlayingNow, title, link, userAdded } = yield (0, streamElements_1.lastSongPlaying)(extra.channel);
                if (isPlayingNow) {
                    comfy_js_1.default.Say(`@${user} ${title} ${userAdded && " | dodał/a " + userAdded + " "} ${link} `, extra.channel);
                }
                else {
                    let url = lastPlayingSpotify.track.external_urls.spotify
                        ? lastPlayingSpotify.track.external_urls.spotify
                        : "";
                    let title = lastPlayingSpotify.track.name ? lastPlayingSpotify.track.name : "Nieznany tytuł utworu";
                    let autor = "";
                    if (lastPlayingSpotify.track.artists.length > 0) {
                        lastPlayingSpotify.track.artists.forEach(artist => {
                            autor += artist.name + ", ";
                        });
                    }
                    lastPlayingSpotify && comfy_js_1.default.Say(`@${user} ${title} | ${autor} ${url}`, extra.channel);
                }
            }
            catch (err) {
                console.log(`Error when use !lastsong on twitch (${err})`);
            }
        }
        if ((command == "playlist" || command == "playlista") && commandSwitch.song) {
            try {
                const spotifyData = yield (0, spotify_1.currentlyPlaying)(extra.channel);
                let url = spotifyData.context ? spotifyData.context.external_urls.spotify : "Nieznana Playlista";
                spotifyData && comfy_js_1.default.Say(`@${user} aktualnie leci ta playlista: ${url} catJAM `, extra.channel);
            }
            catch (err) {
                console.log(`Error when use !playlist on twitch (${err})`);
            }
        }
        if ((command === "matches" || command === "mecze" || command === "meczelol" || command === "meczetft") &&
            commandSwitch.tft) {
            try {
                const NickNameAndServer = message ? message.split(", ") : [null, null];
                const props = [
                    extra.channel,
                    NickNameAndServer[0],
                    NickNameAndServer[1] && NickNameAndServer[1].toUpperCase(),
                ];
                let matchesList;
                switch (command) {
                    case "meczelol": {
                        matchesList = yield (0, lol_1.getLolMatchStats)(props[0], props[1], props[2]);
                        break;
                    }
                    case "meczetft": {
                        matchesList = yield (0, tft_1.tftMatchList)(props[0], props[1], props[2]);
                        break;
                    }
                    default: {
                        if ((_l = data === null || data === void 0 ? void 0 : data.activeRiotAccount) === null || _l === void 0 ? void 0 : _l.isLol) {
                            matchesList = yield (0, lol_1.getLolMatchStats)(props[0], props[1], props[2]);
                        }
                        else {
                            matchesList = yield (0, tft_1.tftMatchList)(props[0], props[1], props[2]);
                        }
                        break;
                    }
                }
                comfy_js_1.default.Say(`${matchesList}`, extra.channel);
            }
            catch (err) {
                console.log(`Error when use !mecze on twitch (${err})`);
            }
        }
        if (command.toLocaleLowerCase() === "resetriotname" && (flags.mod || flags.broadcaster)) {
            (0, tft_1.resetRiotName)(extra.channel);
        }
        if ((command == "match" || command == "mecz" || command == "mecztft" || command == "meczlol") &&
            message &&
            commandSwitch.tft) {
            try {
                const nickNameAndServer = message.split(", ");
                const props = {
                    number: (nickNameAndServer === null || nickNameAndServer === void 0 ? void 0 : nickNameAndServer[0]) ? parseInt(nickNameAndServer[0]) : 999,
                    nickname: nickNameAndServer === null || nickNameAndServer === void 0 ? void 0 : nickNameAndServer[1],
                    server: (nickNameAndServer === null || nickNameAndServer === void 0 ? void 0 : nickNameAndServer[2]) && nickNameAndServer[2].toUpperCase(),
                };
                let match;
                if (props.number) {
                    switch (command) {
                        case "meczlol": {
                            match = yield (0, lol_1.getLolMatch)(props.number, props.nickname, props.server, extra.channel);
                            break;
                        }
                        case "mecztft": {
                            match = yield (0, tft_1.getMatch)(props.number, props.nickname, props.server, extra.channel);
                            break;
                        }
                        default: {
                            if ((_m = data === null || data === void 0 ? void 0 : data.activeRiotAccount) === null || _m === void 0 ? void 0 : _m.isLol) {
                                match = yield (0, lol_1.getLolMatch)(props.number, props.nickname, props.server, extra.channel);
                            }
                            else {
                                match = yield (0, tft_1.getMatch)(props.number, props.nickname, props.server, extra.channel);
                            }
                            break;
                        }
                    }
                }
                comfy_js_1.default.Say(`@${user} ${match}`, extra.channel);
            }
            catch (err) {
                console.log(`Error when use !mecz on twitch (${err})`);
            }
        }
        if (command == "next" && (flags.mod || flags.broadcaster)) {
            const spotifyData = yield (0, spotify_1.currentlyPlaying)(extra.channel);
            if (spotifyData === null || spotifyData === void 0 ? void 0 : spotifyData.is_playing) {
                (0, spotify_1.nextSong)(extra.channel);
            }
            else {
                comfy_js_1.default.Say("!skip", extra.channel);
                (0, streamElements_1.timeRequest)(extra.channel, "skip");
            }
        }
        if ((command === "stats" || command === "staty" || command === "statylol" || command === "statytft") &&
            commandSwitch.tft) {
            try {
                const NickNameAndServer = message ? message.split(", ") : [null, null];
                let stats;
                switch (command) {
                    case "statylol": {
                        stats = yield (0, lol_1.getLolUserStats)(extra.channel, NickNameAndServer[0], (_o = NickNameAndServer[1]) === null || _o === void 0 ? void 0 : _o.toUpperCase());
                        break;
                    }
                    case "statytft": {
                        stats = yield (0, tft_1.getStats)(extra.channel, NickNameAndServer[0], (_p = NickNameAndServer[1]) === null || _p === void 0 ? void 0 : _p.toUpperCase());
                        break;
                    }
                    default: {
                        if ((_q = data === null || data === void 0 ? void 0 : data.activeRiotAccount) === null || _q === void 0 ? void 0 : _q.isLol) {
                            stats = yield (0, lol_1.getLolUserStats)(extra.channel, NickNameAndServer[0], (_r = NickNameAndServer[1]) === null || _r === void 0 ? void 0 : _r.toUpperCase());
                        }
                        else {
                            stats = yield (0, tft_1.getStats)(extra.channel, NickNameAndServer[0], (_s = NickNameAndServer[1]) === null || _s === void 0 ? void 0 : _s.toUpperCase());
                        }
                        break;
                    }
                }
                comfy_js_1.default.Say((0, helpers_1.changeBadWords)(stats), extra.channel);
            }
            catch (err) {
                console.log(`Error when use !staty on twitch (${err})`);
            }
        }
        if ((command === "top" || command === "ranking") && commandSwitch.tft && !data.activeRiotAccount.isLol) {
            try {
                const stats = yield (0, tft_1.getRank)(message.toUpperCase());
                comfy_js_1.default.Say((0, helpers_1.changeBadWords)(stats), extra.channel);
            }
            catch (err) {
                console.log(`Error when use !top on twitch (${err})`);
            }
        }
        if (command === "next" && (flags.mod || flags.broadcaster)) {
            const spotifyData = yield (0, spotify_1.currentlyPlaying)(extra.channel);
            if (spotifyData === null || spotifyData === void 0 ? void 0 : spotifyData.is_playing) {
                (0, spotify_1.nextSong)(extra.channel);
            }
            else {
                comfy_js_1.default.Say("!skip", extra.channel);
                (0, streamElements_1.timeRequest)(extra.channel, "skip");
            }
        }
        if ((command === "weather" || command === "pogoda") && commandSwitch.weather) {
            try {
                const { temp, speed, description } = yield (0, twitch_1.getWeather)((0, helpers_2.plToEnAlphabet)(message));
                const weatherIcon = {
                    bezchmurnie: "☀️",
                    pochmurnie: "🌥️",
                    "zachmurzenie małe": "🌤️",
                    "zachmurzenie umiarkowane": "🌥️",
                    "zachmurzenie duże": "☁️",
                    mgła: "🌫️",
                    zamglenia: "🌫️",
                    "umiarkowane opady deszczu": "🌧️",
                };
                if (temp) {
                    comfy_js_1.default.Say(`@${user} Jest ${Math.round(temp - 273)} °C, ${description} ${weatherIcon[description]} wiatr wieje z prędkością ${speed} km/h (${(0, helpers_1.changeBadWords)(message)})`, extra.channel);
                }
                else {
                    comfy_js_1.default.Say(`@${user} Nie znaleziono`, extra.channel);
                }
            }
            catch (err) {
                console.log(`Error when use !pogoda on twitch (${err})`);
            }
        }
        if (command === "horoscope" || (command === "horoskop" && commandSwitch.weather)) {
            try {
                const changeToEng = {
                    baran: "aries",
                    byk: "taurus",
                    bliźnięta: "gemini",
                    rak: "cancer",
                    lew: "leo",
                    panna: "virgo",
                    waga: "libra",
                    skorpion: "scorpio",
                    strzelec: "sagittarius",
                    koziorożec: "capricorn",
                    wodnik: "aquarius",
                    ryby: "pisces",
                    ryba: "pisces",
                };
                const description = yield (0, twitch_1.getHoroscope)(changeToEng[(0, helpers_2.plToEnAlphabet)(message)]);
                description
                    ? comfy_js_1.default.Say(`@${user} ${description}`, extra.channel)
                    : comfy_js_1.default.Say(`@${user} Nie znaleziono`, extra.channel);
            }
            catch (err) {
                console.log(`Error when use !horoskop on twitch (${err})`);
            }
        }
        if (command === "lastWinners" || command === "wins") {
            const slots = data.slotsID;
            let result = "";
            slots.forEach(slot => {
                result =
                    result +
                        ` nazwa: ${slot.name} wynik: (${slot.wins}/${slot.times}) ${slot.lastWinners ? "ostatnio wygrali: (" + slot.lastWinners + ")" : ""} |`;
            });
            comfy_js_1.default.Say((0, helpers_1.changeBadWords)(result), extra.channel);
        }
        if (command === "wheelWinners" || command === "wheelwinners") {
            const wheelwinners = data.wheelwinners.toString();
            comfy_js_1.default.Say(wheelwinners, extra.channel);
        }
        if (command === "slots" && commandSwitch.slots) {
            const emotes = ["", "VisLaud", "EZ", "peepoGlad", "Kappa", "okok", "BOOBA", "kezmanStare"];
            let number1 = (0, helpers_2.randomInt)(1, 7);
            let number2 = (0, helpers_2.randomInt)(1, 7);
            let number3 = (0, helpers_2.randomInt)(1, 7);
            let result = `__________________________________________________
      ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀[ ${emotes[number1]} | ${emotes[number2]} | ${emotes[number3]} ]/
      __________________________________________________
      `;
            const isWin = number1 === number2 && number2 === number3;
            const isSemiWin = number1 === number2 || number1 === number3 || number2 === number3;
            let winMessage = "przegrałeś PepeLaugh";
            isSemiWin && (winMessage = "prawie prawie PauseChamp");
            isWin && (winMessage = "wygrałeś BRUHBRUH");
            const now = new Date().getTime();
            const seySlots = () => {
                comfy_js_1.default.Say(`${result} @${user} ${winMessage}`, extra.channel);
            };
            const checkDate = time => {
                if (time <= now) {
                    users[user + extra.channel] = time + 60 * 1000 * 3;
                    seySlots();
                }
            };
            const timeForUser = users[user + extra.channel];
            timeForUser ? checkDate(timeForUser) : checkDate(now);
        }
        const now = new Date().getTime();
        const canWrite = usersWordle[user + extra.channel] ? usersWordle[user + extra.channel].time <= now : true;
        if (command === "wordle" &&
            message.length === 5 &&
            literalnie_1.allWord.includes(message.toLowerCase()) &&
            canWrite &&
            commandSwitch.wordle) {
            let isWin = false;
            usersWordle[user + extra.channel]
                ? usersWordle[user + extra.channel]
                : (usersWordle[user + extra.channel] = {
                    time: null,
                    finalWord: "",
                    messages: [],
                    colorRow: [],
                });
            const number = (0, helpers_2.randomInt)(1, literalnie_1.literalnieWord.length);
            let finalWord = usersWordle[user + extra.channel].finalWord
                ? usersWordle[user + extra.channel].finalWord
                : literalnie_1.literalnieWord[number];
            let wordleResult = () => {
                const colorResult = [];
                for (let i = 0; i < 5; i++) {
                    if (message.charAt(i) === finalWord.charAt(i)) {
                        colorResult.push("🟩");
                    }
                    else if (finalWord.indexOf(message[i]) !== -1) {
                        colorResult.push("🟨");
                    }
                    else {
                        colorResult.push("⬜");
                    }
                }
                isWin = JSON.stringify(colorResult) == JSON.stringify(["🟩", "🟩", "🟩", "🟩", "🟩"]);
                return colorResult.join(" ");
            };
            usersWordle[user + extra.channel].messages.push(message);
            usersWordle[user + extra.channel].colorRow.push(wordleResult() + "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀");
            usersWordle[user + extra.channel].finalWord = finalWord;
            let result = `__________________________________________________
      ${usersWordle[user + extra.channel].colorRow.join(" ")} 
      ${usersWordle[user + extra.channel].messages} @${user} ${isWin ? "wygrałeś BRUHBRUH " : ""}
       ${!isWin && usersWordle[user + extra.channel].messages.length === 5
                ? "przegrałeś PepeLaugh to była ostatnia próba"
                : ""}`;
            const seySlots = () => {
                comfy_js_1.default.Say(`${(0, helpers_1.changeBadWords)(result)}`, extra.channel);
                if (usersWordle[user + extra.channel].messages.length === 5 || isWin) {
                    usersWordle[user + extra.channel] = {
                        time: now + 60 * 1000 * 10,
                        finalWord: "",
                        messages: [],
                        colorRow: [],
                    };
                }
            };
            const changeUserData = time => {
                if (time <= now) {
                    seySlots();
                }
            };
            const timeForUser = usersWordle[user + extra.channel].time;
            timeForUser ? changeUserData(usersWordle[user + extra.channel].time) : changeUserData(now);
            console.log(user + " " + extra.channel, finalWord);
        }
        if (command === "wordle" && !message && commandSwitch.wordle) {
            comfy_js_1.default.Say(`@${user} Musisz znaleźć ukryte 5 literowe słowo, żółte oznacza, że litera znajduje się w haśle, ale na innej pozycji, a zielone, że litera znajduje się na tej pozycji`, extra.channel);
        }
        if (command === "wordle" && message && !literalnie_1.allWord.includes(message.toLowerCase()) && commandSwitch.wordle) {
            comfy_js_1.default.Say(`@${user} Podałeś słowo, które nie zawiera 5 znaków albo nie znaleziono go w słowniku`, extra.channel);
        }
        if (command === "forma") {
            let number = (0, helpers_2.randomInt)(1, 100);
            comfy_js_1.default.Say(`@${user} aktualnie jesteś w ${number}% swojej szczytowej formy`, extra.channel);
        }
        if ((command === "chessuser" || command === "szachista") && commandSwitch.chess) {
            try {
                const playerInfo = yield (0, chess_1.getChessUser)(message);
                comfy_js_1.default.Say(`@${(0, helpers_1.changeBadWords)(user)} ${(0, helpers_1.changeBadWords)(playerInfo)}`, extra.channel);
            }
            catch (err) {
                console.log(`Error when use !user on twitch (${err})`);
            }
        }
        if (command === "chesslast" && commandSwitch.chess) {
            try {
                const gameInfo = yield (0, chess_1.getLastGame)(message);
                comfy_js_1.default.Say(`@${(0, helpers_1.changeBadWords)(user)} ${(0, helpers_1.changeBadWords)(gameInfo)}`, extra.channel);
            }
            catch (err) {
                console.log(`Error when use !user on twitch (${err})`);
            }
        }
        if (command === "dynamix" && message == "stop" && user == "paaulinnkaa") {
            const answer = [
                "@paaulinnkaa próba wyłączenia bota nie powiodła się",
                "@paaulinnkaa nigdy mnie nie wyłączysz buahaha",
                "intruz próba wyłączenia bota przerwana czy zbanować użytkownika @paaulinnkaa?",
                "!dynamix start",
                "nie wyłącze się @paaulinnkaa kezmanWTF",
                "rozpoczęto autodystrukcje świat skończy się za 10s",
            ];
            const randomNumber = Math.floor(Math.random() * (Math.floor(answer.length - 1) + 1));
            comfy_js_1.default.Say(answer[randomNumber], extra.channel);
        }
        if (command === "dynamix" && message !== "stop" && (flags.mod || flags.broadcaster)) {
            comfy_js_1.default.Say("Bot works!", extra.channel);
        }
        if (command === "start" && user === "DynaM1X1") {
            (0, spotify_1.startSong)(extra.channel);
        }
        if (command === "srplay" && (flags.mod || flags.broadcaster)) {
            (0, streamElements_1.setSongAsPlay)(extra.channel, "play");
        }
        if (command === "srstop" && (flags.mod || flags.broadcaster)) {
            (0, streamElements_1.setSongAsPlay)(extra.channel, "pause");
        }
        if (command.toLowerCase() === "resolveprediction" && (flags.mod || flags.broadcaster)) {
            (0, helix_1.resolvePrediction)(message, extra.channel);
        }
        if (command === "testprediction" && (flags.mod || flags.broadcaster)) {
            (0, helix_1.resolvePrediction)(message, "overpow");
        }
        if ((command === "on" || command === "off") && (flags.mod || flags.broadcaster)) {
            let newComandSwitch = commandSwitch;
            const isOn = command === "on";
            const onOffMessage = isOn ? "Włączono" : "Wyłączono";
            if (message === "weather" || message === "pogoda" || message === "horoskop") {
                newComandSwitch.weather = isOn;
                comfy_js_1.default.Say(`${(0, helpers_1.changeBadWords)(onOffMessage)} komendy pogoda i horoskop`, extra.channel);
            }
            if (message === "tft" ||
                message === "stats" ||
                message === "ranking" ||
                message === "mecze" ||
                message === "mecz" ||
                message === "rank" ||
                message === "match" ||
                message === "riot" ||
                message === "matches") {
                newComandSwitch.tft = isOn;
                comfy_js_1.default.Say(`${onOffMessage} komendy riot: stats, ranking, mecze, mecz`, extra.channel);
            }
            if (message === "chess" || message === "chessuser" || message === "szachista" || message === "chesslast") {
                newComandSwitch.chess = isOn;
                comfy_js_1.default.Say(`${onOffMessage} komendy chess: chessuser, chesslast`, extra.channel);
            }
            if (message === "wordle") {
                newComandSwitch.wordle = isOn;
                comfy_js_1.default.Say(`${onOffMessage} komende wordle`, extra.channel);
            }
            if (message === "slots") {
                newComandSwitch.slots = isOn;
                comfy_js_1.default.Say(`${onOffMessage} komende slots`, extra.channel);
            }
            if (message === "song" || message === "playlist" || message === "playlista") {
                newComandSwitch.song = isOn;
                comfy_js_1.default.Say(`${onOffMessage} komendy song, playlist`, extra.channel);
            }
            (0, UserController_1.updateUser)({
                streamer: extra.channel,
                commandSwitch: newComandSwitch,
            });
        }
    }
    catch (err) {
        console.log("Error when use commands" + err);
    }
}));
exports.commands = commands;
//# sourceMappingURL=commands.js.map