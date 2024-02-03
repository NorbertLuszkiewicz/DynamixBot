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
exports.resolvePrediction = exports.getPredition = exports.sendMessage = exports.timeout = exports.getUserId = exports.getHeader = void 0;
const axios_1 = __importDefault(require("axios"));
const comfy_js_1 = __importDefault(require("comfy.js"));
const UserController_1 = require("../../../controllers/UserController");
const URL = "https://api.twitch.tv/helix/";
const getHeader = () => __awaiter(void 0, void 0, void 0, function* () {
    const [data] = yield (0, UserController_1.getUser)("dynam1x1");
    return {
        headers: {
            Authorization: `Bearer ${data.twitchAccessToken}`,
            "Client-Id": process.env.BOT_CLIENT_ID,
            "Content-Type": "application/json",
        },
    };
});
exports.getHeader = getHeader;
const getUserId = (name) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { data } = yield axios_1.default.get(`${URL}users?login=${name}`, yield (0, exports.getHeader)());
        return (_a = data === null || data === void 0 ? void 0 : data.data[0]) === null || _a === void 0 ? void 0 : _a.id;
    }
    catch (err) {
        console.log("Error getUserId", (_b = err.response) === null || _b === void 0 ? void 0 : _b.data);
    }
});
exports.getUserId = getUserId;
const timeout = (userName, duration, reason, streamer) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const body = {
        data: {
            user_id: yield (0, exports.getUserId)(userName),
            duration,
            reason,
        },
    };
    try {
        yield axios_1.default.post(`${URL}moderation/bans?broadcaster_id=${yield (0, exports.getUserId)(streamer)}&moderator_id=171103106`, body, yield (0, exports.getHeader)());
    }
    catch (err) {
        console.log("Error timeout function in twitch/helix", (_c = err.response) === null || _c === void 0 ? void 0 : _c.data);
    }
});
exports.timeout = timeout;
const sendMessage = (message, streamer) => {
    comfy_js_1.default.Say(message, streamer);
};
exports.sendMessage = sendMessage;
const getPredition = (streamer) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const brodecasterId = yield (0, exports.getUserId)(streamer);
        const { data } = yield axios_1.default.get(`${URL}predictions?broadcaster_id=${brodecasterId}`, yield (0, exports.getHeader)());
        console.log(data, "getPrediction");
        return data[0];
    }
    catch (err) {
        console.log("Error getPrediction", (_d = err.response) === null || _d === void 0 ? void 0 : _d.data);
    }
});
exports.getPredition = getPredition;
const resolvePrediction = (option, streamer) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    try {
        const prediction = yield (0, exports.getPredition)(streamer);
        const winningPrediction = prediction.outcomes.filter(outcome => outcome.title.toLowerCase().trim() === option.toLowerCase().trim());
        const body = {
            broadcaster_id: prediction.broadcaster_id,
            id: prediction.id,
            status: "RESOLVED",
            winning_outcome_id: winningPrediction[0].id,
        };
        const { data } = yield axios_1.default.patch(`${URL}predictions`, body, yield (0, exports.getHeader)());
        console.log(data, "getPrediction");
    }
    catch (err) {
        console.log("Error getPrediction", (_e = err.response) === null || _e === void 0 ? void 0 : _e.data);
    }
});
exports.resolvePrediction = resolvePrediction;
//# sourceMappingURL=helix.js.map