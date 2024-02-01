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
const mongodb_1 = require("mongodb");
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const spotify_1 = require("./apis/spotify");
const streamElements_1 = require("./apis/streamElements");
const twitch_1 = require("./apis/twitch/events/twitch");
const twitch_2 = require("./apis/twitch");
const lol_1 = require("./apis/riot/lol");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
//Initial functions;
const client = new mongodb_1.MongoClient(`mongodb+srv://${process.env.MONGODB}&w=majority`);
function onInit() {
    console.log("INIT");
    (0, twitch_2.twitchCommands)();
    (0, spotify_1.setTimeoutVolume)();
    (0, streamElements_1.setTimeoutVolume)();
    (0, spotify_1.refreshAccessToken)();
    (0, twitch_1.refreshTwitchTokens)();
    (0, lol_1.checkActiveRiotAccount)();
    (0, lol_1.updateRiotItemsAndChampions)();
    setInterval(spotify_1.refreshAccessToken, 30 * 60 * 1000);
    setInterval(lol_1.checkActiveRiotAccount, 3 * 60 * 1000);
    setInterval(twitch_1.refreshTwitchTokens, 60 * 60 * 1000);
    setInterval(lol_1.updateRiotItemsAndChampions, 60 * 60 * 1000);
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.connect();
            yield client.db("admin").command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
            onInit();
            app.listen(process.env.PORT || 80);
        }
        finally {
            yield client.close();
        }
    });
}
run().catch(console.dir);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use("/", routes_1.default);
//# sourceMappingURL=app.js.map