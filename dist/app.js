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
const twitch_1 = require("./apis/twitch/events/twitch");
const riot_1 = require("./apis/riot");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
//Initial functions;
onInit();
const client = new mongodb_1.MongoClient(`mongodb+srv://${process.env.MONGODB}&w=majority`
// , {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }
);
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect the client to the server	(optional starting in v4.7)
            yield client.connect();
            // Send a ping to confirm a successful connection
            yield client.db("admin").command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
            (0, spotify_1.refreshAccessToken)();
            (0, twitch_1.refreshTwitchTokens)();
            (0, riot_1.checkActiveRiotAccount)();
            app.listen(process.env.PORT || 80);
        }
        finally {
            // Ensures that the client will close when you finish/error
            yield client.close();
        }
    });
}
run().catch(console.dir);
function onInit() {
    console.log("INIT");
    // twitchCommands();
    // setTimeoutVolume();
    // setTimeoutVolumeStreamElements();
    // setInterval(refreshAccessToken, 1800 * 1000);
    // setInterval(checkActiveRiotAccount, 180 * 1000);
    // setInterval(refreshTwitchTokens, 10000 * 1000);
}
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use("/", routes_1.default);
app.use((req, res, next) => { });
//# sourceMappingURL=app.js.map