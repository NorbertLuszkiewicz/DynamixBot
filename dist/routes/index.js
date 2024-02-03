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
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const spotify_1 = require("../apis/spotify");
const UserController_1 = require("../controllers/UserController");
const twitch_1 = require("../apis/twitch/events/twitch");
const tft_1 = require("../apis/riot/tft");
const helix_1 = require("../apis/twitch/events/helix");
router.get("/spotify", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    const scopes = [
        "ugc-image-upload",
        "user-read-playback-state",
        "user-modify-playback-state",
        "user-read-currently-playing",
        "streaming",
        "app-remote-control",
        "user-read-email",
        "user-read-private",
        "playlist-read-collaborative",
        "playlist-modify-public",
        "playlist-read-private",
        "playlist-modify-private",
        "user-library-modify",
        "user-library-read",
        "user-top-read",
        "user-read-playback-position",
        "user-read-recently-played",
        "user-follow-read",
        "user-follow-modify",
    ];
    res.redirect(`https://accounts.spotify.com/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&scope=${encodeURIComponent(scopes.join())}&redirect_uri=${`https://dynamix-bot.glitch.me/callback`}&state=${req.query.user}`);
});
router.get("/callback", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.query.code;
    const user = req.query.state;
    try {
        const callback = yield (0, spotify_1.addSpotify)(user, code);
        callback.status === "success"
            ? res.redirect(`https://dynamixbot.pl/dashboard`)
            : res.redirect(`https://dynamixbot.pl/?error${callback ? callback.status : 400}`);
    }
    catch (_a) {
        res.redirect(`https://dynamixbot.pl/?error${400}`);
    }
}));
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    res.send("work");
}));
router.get("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.query.code;
    const state = req.query.state;
    const redirectUrl = state === "c3ab8aa609ea11e793ae92361f002671" ? "https://dynamixbot.pl/" : "http://localhost:4200/";
    try {
        const callback = yield (0, twitch_1.addNewUser)(code);
        callback.status === "success"
            ? res.redirect(`${redirectUrl}information?name=${callback.name}&token=${callback.token}`)
            : res.send("Something went wrong");
    }
    catch (_b) {
        console.log("Error when redirect with twitch data");
    }
}));
router.get("/account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    const name = req.query.name;
    const token = req.query.token;
    try {
        const [user] = yield (0, UserController_1.getUser)(name);
        if (user) {
            user.twitchAccessToken === token
                ? res.send(user)
                : res.status(401).send({
                    message: "Unauthorized",
                });
        }
        else {
            res.status(404).send({
                message: "This user dosn't exist",
            });
        }
    }
    catch (_c) {
        console.log("Error when get account");
        res.status(400).send({
            message: "Not Found",
        });
    }
}));
router.put("/streamelements", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header("Access-Control-Allow-Origin", "https://dynamixbot.pl");
    res.header("Access-Control-Allow-Methods", "PUT");
    const clientID = req.body.clientID;
    const token = req.body.token;
    const user = req.body.user;
    try {
        yield (0, UserController_1.updateUser)({
            streamer: user,
            clientSongRequestID: clientID,
            clientSongRequestSecret: token,
        });
        res.status(200).send({
            message: "Successfully saved changes",
        });
    }
    catch (_d) {
        console.log("Error when get account");
        res.status(400).send({
            message: "Something went wrong",
        });
    }
}));
router.post("/sendmessage", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST");
    const body = JSON.parse(req.body);
    try {
        (0, helix_1.sendMessage)(body.message, body.streamer);
        if (body.addwinner) {
            const [user] = yield (0, UserController_1.getUser)(body.streamer);
            user.wheelwinners.length === 5 && user.wheelwinners.pop();
            user.wheelwinners ? user.wheelwinners.unshift(body.message) : (user.wheelwinners = [body.message]);
            yield (0, UserController_1.updateUser)({
                streamer: body.streamer,
                wheelwinners: user.wheelwinners,
            });
        }
        res.status(200).send({
            message: "Successfully send message",
        });
    }
    catch (_e) {
        console.log("Error when send message");
        res.status(400).send({
            message: "Something went wrong",
        });
    }
}));
router.put("/volumeaward", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header("Access-Control-Allow-Origin", "https://dynamixbot.pl");
    res.header("Access-Control-Allow-Methods", "PUT");
    const min = req.body.min;
    const max = req.body.max;
    const minSR = req.body.minSR;
    const maxSR = req.body.maxSR;
    const time = req.body.time;
    const user = req.body.user;
    console.log(req.body);
    try {
        const [data] = yield (0, UserController_1.getUser)(user);
        const id = data.volumeSongID ? data.volumeSongID.id : "";
        yield (0, UserController_1.updateUser)({
            streamer: user,
            volumeSongID: {
                id,
                min,
                max,
                minSR,
                maxSR,
                time,
            },
        });
        res.status(200).send({
            message: "Successfully saved changes",
        });
    }
    catch (_f) {
        console.log("Error when get account");
        res.status(400).send({
            message: "Something went wrong",
        });
    }
}));
router.put("/riot", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header("Access-Control-Allow-Origin", "https://dynamixbot.pl");
    res.header("Access-Control-Allow-Methods", "PUT");
    const name = req.body.name;
    const server = req.body.server;
    const user = req.body.user;
    try {
        (0, tft_1.addTftUser)(name, server, user);
        res.status(200).send({
            message: "Successfully saved changes",
        });
    }
    catch (_g) {
        console.log("Error when add riot account");
        res.status(400).send({
            message: "Something went wrong",
        });
    }
}));
router.put("/riot-remove", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header("Access-Control-Allow-Origin", "https://dynamixbot.pl");
    res.header("Access-Control-Allow-Methods", "PUT");
    const name = req.body.name;
    const server = req.body.server;
    const user = req.body.user;
    try {
        (0, tft_1.removeTftUser)(name, server, user);
        res.status(200).send({
            message: "Successfully saved changes",
        });
    }
    catch (_h) {
        console.log("Error when add riot account");
        res.status(400).send({
            message: "Something went wrong",
        });
    }
}));
router.put("/slots", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header("Access-Control-Allow-Origin", "https://dynamixbot.pl");
    res.header("Access-Control-Allow-Methods", "PUT");
    const { name, emotes, withBan, user } = req.body;
    const newSlots = {
        name,
        id: null,
        withBan,
        emotes: parseInt(emotes),
        times: 0,
        wins: 0,
    };
    try {
        const [data] = yield (0, UserController_1.getUser)(user);
        if (data.slotsID && data.slotsID.length > 0) {
            yield (0, UserController_1.updateUser)({
                streamer: user,
                slotsID: [...data.slotsID, newSlots],
            });
        }
        else {
            yield (0, UserController_1.updateUser)({
                streamer: user,
                slotsID: [newSlots],
            });
        }
        res.status(200).send({
            message: "Successfully saved changes",
        });
    }
    catch (err) {
        console.log("Error when add slots award");
        res.status(400).send({
            message: "Something went wrong",
        });
    }
}));
router.put("/command_switch", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header("Access-Control-Allow-Origin", "https://dynamixbot.pl");
    res.header("Access-Control-Allow-Methods", "PUT");
    const { user, body } = req.body;
    try {
        const [data] = yield (0, UserController_1.getUser)(user);
        yield (0, UserController_1.updateUser)({
            streamer: user,
            commandSwitch: body,
        });
        res.status(200).send({
            message: "Successfully saved changes",
        });
    }
    catch (err) {
        console.log("Error when change command switch award");
        res.status(400).send({
            message: "Something went wrong",
        });
    }
}));
router.put("/slot_remove", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header("Access-Control-Allow-Origin", "https://dynamixbot.pl");
    res.header("Access-Control-Allow-Methods", "PUT");
    const { id, user } = req.body;
    try {
        const [data] = yield (0, UserController_1.getUser)(user);
        const newSlotsList = data.slotsID.filter(slot => {
            return slot.name !== id;
        });
        yield (0, UserController_1.updateUser)({
            streamer: user,
            slotsID: newSlotsList,
        });
        res.status(200).send({
            message: "Successfully saved changes",
        });
    }
    catch (err) {
        console.log("Error when delete slot");
        res.status(400).send({
            message: "Something went wrong",
        });
    }
}));
exports.default = router;
//# sourceMappingURL=index.js.map