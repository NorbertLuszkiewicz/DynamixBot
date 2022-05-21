"use strict";

const runner = () => {
  var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
      return mod && mod.__esModule ? mod : { default: mod };
    };
  Object.defineProperty(exports, "__esModule", { value: true });
  const discord_js_1 = __importDefault(require("discord.js"));
  const config_1 = require("./config");
  const client = new discord_js_1.default.Client();

  client.on("message", (msg) => {
    if (msg.author.id == client.user.id) return;
    if (msg.guild && config_1.GuildBlacklist.includes(msg.guild.id)) return;
    const matched = config_1.URLRegex.exec(msg.content);
    if (matched && matched[0]) {
      const url = new URL(matched[0]);
      if (!["vm.tiktok.com", "tiktok.com", "www.tiktok.com"].includes(url.host))
        return;
      if (
        ["tiktok.com", "www.tiktok.com"].includes(url.host) &&
        !url.pathname.includes("@") &&
        !url.pathname.includes("/video/") &&
        !url.pathname.includes("/t/")
      )
        return;
      if (msg.content == matched[0] && msg.deletable) msg.delete();
      msg.channel.send(
        `TikTok shared by ${msg.author.tag}\n${config_1.WorkerHost}${url.pathname}`
      );
    }
  });
  client.login(config_1.DiscordToken);
  //# sourceMappingURL=index.js.map
};

module.exports = {
  runner,
};
