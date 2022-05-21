"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildBlacklist =
  exports.URLRegex =
  exports.WorkerHost =
  exports.DiscordToken =
    void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.DiscordToken = process.env.BOT_TOKEN;
exports.WorkerHost =
  "https://tiktokbot.dynam1x.workers.dev" || "https://vm.dstn.to";
exports.URLRegex =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
exports.GuildBlacklist = process.env.GUILD_BLACKLIST?.split(",") || [];
//# sourceMappingURL=config.js.map
