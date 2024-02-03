"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiotSchema = void 0;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.connect(`mongodb+srv://${process.env.MONGODB}&w=majority`);
exports.RiotSchema = new Schema({
    streamer: {
        type: String,
        required: true,
        unique: true,
    },
    riotAccountList: {
        type: Array,
        default: [],
    },
    activeRiotAccount: {
        type: {
            name: String,
            server: String,
            date: Number,
            puuid: String,
            id: String,
            lol_puuid: String,
            lol_id: String,
            isLol: Boolean,
        },
        default: null,
    },
    matchList: {
        type: Array,
        default: [],
    },
});
mongoose.model("riot", exports.RiotSchema);
//# sourceMappingURL=Riot.js.map