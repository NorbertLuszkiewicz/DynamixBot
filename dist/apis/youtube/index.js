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
exports.isBlockedVideo = void 0;
const axios_1 = __importDefault(require("axios"));
const variables_1 = require("../../types/variables");
const isBlockedVideo = (url, streamer, urlId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        let id = urlId;
        if (url) {
            id = url.slice(url.lastIndexOf("v=") + 2);
            id = id.slice(0, id.indexOf("&"));
        }
        const { data } = yield axios_1.default.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${id}&key=${process.env.YT_ID_TOKEN}`);
        const isVideo = data.pageInfo && data.pageInfo.totalResults;
        let isBlocked = false;
        if (((_d = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.items[0]) === null || _a === void 0 ? void 0 : _a.contentDetails) === null || _b === void 0 ? void 0 : _b.regionRestriction) === null || _c === void 0 ? void 0 : _c.blocked) === null || _d === void 0 ? void 0 : _d.includes("PL")) ||
            ((_g = (_f = (_e = data === null || data === void 0 ? void 0 : data.items[0]) === null || _e === void 0 ? void 0 : _e.contentDetails) === null || _f === void 0 ? void 0 : _f.contentRating) === null || _g === void 0 ? void 0 : _g.ytRating) === variables_1.YT_AGE_RESTRICTED) {
            isBlocked = true;
        }
        const resultData = { isVideo, isBlocked };
        return resultData;
    }
    catch (err) {
        console.log(`Error while getting youtube video (${err} )`);
    }
});
exports.isBlockedVideo = isBlockedVideo;
//# sourceMappingURL=index.js.map