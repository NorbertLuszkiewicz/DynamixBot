const ComfyJS = require("comfy.js");
const { getWeather } = require("./twitch");
const { tftMatchList, getMatch, getStats , getRank} = require("../riot/riot.js");
const { currentlyPlaying, nextSong , startSong} = require("../spotify");
const { songPlayingNow, timeRequest } = require("../streamElements");

const commands = () =>
  (ComfyJS.onCommand = async (user, command, message, flags, extra) => {
    if (command == "song") {
      try {
        const spotifyData = await currentlyPlaying(extra.channel);
        const { isPlayingNow, title, link } = await songPlayingNow(
          extra.channel
        );

        if (isPlayingNow) {
          ComfyJS.Say(`@${user} ${title} ${link}`, extra.channel);
        } else {
          let url = spotifyData.item.external_urls.spotify
            ? spotifyData.item.external_urls.spotify
            : "";
          let title = spotifyData.item.name
            ? spotifyData.item.name
            : "Nieznany tytuł utworu";
          let autor = "";
          if (spotifyData.item.artists.length > 0) {
            spotifyData.item.artists.forEach(artist => {
              autor += artist.name + ", ";
            });
          }

          spotifyData &&
            ComfyJS.Say(`@${user} ${title} | ${autor} ${url}`, extra.channel);
        }
      } catch (err) {
        console.log(`Error when use !song on twitch (${err})`);
      }
    }

    if (command == "playlist" || command == "playlista") {
      try {
        const spotifyData = await currentlyPlaying(extra.channel);

        let url = spotifyData.context
          ? spotifyData.context.external_urls.spotify
          : "Nieznana Playlista";

        spotifyData &&
          ComfyJS.Say(
            `@${user} aktualnie leci ta playlista: ${url} catJAM `,
            extra.channel
          );
      } catch (err) {
        console.log(`Error when use !playlist on twitch (${err})`);
      }
    }

    if (command == "matches" || command == "mecze") {
      try {
        const NickNameAndServer = message ? message.split(", ") : [null, null];

        const matchesList = await tftMatchList(
          extra.channel,
          NickNameAndServer[0],
          NickNameAndServer[1] && NickNameAndServer[1].toUpperCase()
        );

        ComfyJS.Say(`${matchesList}`, extra.channel);
      } catch (err) {
        console.log(`Error when use !mecze on twitch (${err})`);
      }
    }

    if (
      (command == "match" || command == "mecz") &&
      parseInt(message) > 0 &&
      parseInt(message) < 11
    ) {
      try {
        const NickNameAndServer = message.split(", ");
        const match = await getMatch(
          parseInt(NickNameAndServer[0]),
          NickNameAndServer[1],
          NickNameAndServer[2].toUpperCase(),
          extra.channel
        );

        ComfyJS.Say(match, extra.channel);
      } catch (err) {
        console.log(`Error when use !mecz on twitch (${err})`);
      }
    }

    if (command == "next" && (flags.mod || flags.broadcaster)) {
      const { isPlayingNow } = await songPlayingNow(extra.channel);
      if (isPlayingNow) {
        ComfyJS.Say("!skip", extra.channel);
        timeRequest(extra.channel, "skip");
      } else {
        nextSong(extra.channel);
      }
    }

    if (command == "stats" || command == "staty") {
      try {
        const NickNameAndServer = message ? message.split(", ") : [null, null];
        const stats = await getStats(
          extra.channel,
          NickNameAndServer[0],
          NickNameAndServer[1] && NickNameAndServer[1].toUpperCase()
        );

        ComfyJS.Say(stats, extra.channel);
      } catch (err) {
        console.log(`Error when use !staty on twitch (${err})`);
      }
    }
    
    if (command === "top" || command === "ranking" || command === "rank") {
      try {
        const stats = await getRank(
          extra.channel,
          message
        );

        ComfyJS.Say(stats, extra.channel);
      } catch (err) {
        console.log(`Error when use !top on twitch (${err})`);
      }
    }

    if (command === "next" && (flags.mod || flags.broadcaster)) {
      const { isPlayingNow } = await songPlayingNow(extra.channel);
      if (isPlayingNow) {
        ComfyJS.Say("!skip", extra.channel);
        timeRequest(extra.channel, "skip");
      } else {
        nextSong(extra.channel);
      }
    }

    if (command == "weather" || command == "pogoda") {
      try {
        const { temp, speed, description } = await getWeather(message);
        let emote = "";

        {
          bezchmurnie: ":sunn:";
          pochmurnie: "🌤️";
        }

        description == "bezchmurnie" && (emote = "☀️");
        description == "pochmurnie" && (emote = "🌤️");
        description == "zachmurzenie umiarkowane" && (emote = "🌥️");
        description == "zachmurzenie duże" && (emote = "☁️");
        description == "umiarkowane opady deszczu" && (emote = "🌧️");

        temp
          ? ComfyJS.Say(
              `@${user} Jest ${Math.round(
                temp - 273
              )} °C, ${description} ${emote} wiatr wieje z prędkością ${speed} km/h`,
              extra.channel
            )
          : ComfyJS.Say(`@${user} Nie znaleziono`, extra.channel);
      } catch (err) {
        console.log(`Error when use !pogoda on twitch (${err})`);
      }
    }

    if (command === "dynamix" && (flags.mod || flags.broadcaster)) {
      ComfyJS.Say("Bot works!", extra.channel);
    }
    
    if (command === "start" && user === "DynaM1X1") {
      startSong(extra.channel);
    }
  });

module.exports = {
  commands
};
