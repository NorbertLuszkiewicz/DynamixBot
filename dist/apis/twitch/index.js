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
exports.twitchCommands = void 0;
const comfy_js_1 = __importDefault(require("comfy.js"));
const messages_1 = require("./events/messages");
const events_1 = require("./events/events");
const commands_1 = require("./events/commands");
const UserController_1 = require("../../controllers/UserController");
const twitchCommands = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, messages_1.messages)();
        (0, events_1.events)();
        (0, commands_1.commands)();
        (0, messages_1.setTimeoutVolume)();
        const allStreamers = yield (0, UserController_1.getAllUser)();
        const TWITCHCHANNELS = allStreamers.map(streamer => streamer.streamer);
        const TWITCHUSER = "dynam1x1";
        const OAUTH = process.env.OAUTH;
        comfy_js_1.default.Init(TWITCHUSER, OAUTH, TWITCHCHANNELS);
    }
    catch (err) {
        console.log(`Error while connecting to twitch ${err}`);
    }
});
exports.twitchCommands = twitchCommands;
//# sourceMappingURL=index.js.map