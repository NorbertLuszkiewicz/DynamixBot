
const {Client, Intents} = require("discord.js");

const flags = [Intents.FLAGS.GUILDS, Intents.GUILD_MESSAGES]



const runner = () => {
  var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
      return mod && mod.__esModule ? mod : { default: mod };
    };
  Object.defineProperty(exports, "__esModule", { value: true });

  const config_1 = require("./config");
  const client = new Client({ intents: [ Intents.FLAGS.GUILDS] });

  client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

  client.on("interactionCreate", async (msg) => {
    console.log(`${msg.user.tag} in #${msg.channel.name} triggered an interaction.`);
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
      const tiktokPosition =
        msg.content.indexOf("vm.tiktok") >= 0
          ? msg.content.indexOf("vm.tiktok")
          : msg.content.indexOf("tiktok");
      const tiktoklinkPlusRest = msg.content.slice(tiktokPosition);
      const tiktokUrl =
        tiktokPosition >= 0
          ? `\n ${tiktoklinkPlusRest.slice(0, tiktoklinkPlusRest.indexOf(" "))}`
          : "";

      await msg.reply(
        `TikTok shared by ${msg.author.tag}\n${config_1.WorkerHost}${url.pathname} ${tiktokUrl}`
      );
    }
  });

//   client.on("message", (msg) => {
//     console.log(msg);
//     if (msg.author.id == client.user.id) return;
//     if (msg.guild && config_1.GuildBlacklist.includes(msg.guild.id)) return;
//     const matched = config_1.URLRegex.exec(msg.content);
//     if (matched && matched[0]) {
//       const url = new URL(matched[0]);
//       if (!["vm.tiktok.com", "tiktok.com", "www.tiktok.com"].includes(url.host))
//         return;
//       if (
//         ["tiktok.com", "www.tiktok.com"].includes(url.host) &&
//         !url.pathname.includes("@") &&
//         !url.pathname.includes("/video/") &&
//         !url.pathname.includes("/t/")
//       )
//         return;
//       if (msg.content == matched[0] && msg.deletable) msg.delete();
//       const tiktokPosition =
//         msg.content.indexOf("vm.tiktok") >= 0
//           ? msg.content.indexOf("vm.tiktok")
//           : msg.content.indexOf("tiktok");
//       const tiktoklinkPlusRest = msg.content.slice(tiktokPosition);
//       const tiktokUrl =
//         tiktokPosition >= 0
//           ? `\n ${tiktoklinkPlusRest.slice(0, tiktoklinkPlusRest.indexOf(" "))}`
//           : "";

//       msg.channel.send(
//         `TikTok shared by ${msg.author.tag}\n${config_1.WorkerHost}${url.pathname} ${tiktokUrl}`
//       );
//     }
//   });

  client.login(config_1.DiscordToken);
  //# sourceMappingURL=index.js.map
};

module.exports = {
  runner,
};
