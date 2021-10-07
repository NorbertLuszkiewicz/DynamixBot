const ComfyJS = require("comfy.js");
const { getWeather } = require("./twitch");
const { currentlyPlaying, nextSong } = require("../spotify");
const { songPlayingNow, timeRequest } = require("../streamElements");

const commands = () =>
  (ComfyJS.onCommand = async (user, command, message, flags, extra) => {
    if (command == "song") {
      try {
        const spotifyData = await currentlyPlaying(extra.channel);
        const { isPlayingNow, title, link } = songPlayingNow(extra.channel);

        if (isPlayingNow) {
          ComfyJS.Say("@" + user + " " + title + " " + link, extra.channel);
        } else {
          let url = spotifyData.item.external_urls.spotify
            ? spotifyData.item.external_urls.spotify
            : "";
          let title = spotifyData.item.name
            ? spotifyData.item.name
            : "Nieznany tytuł utworu";
          let autor = "";
          if (
            spotifyData.item.artists.length < 4 &&
            spotifyData.item.artists.length > 0
          ) {
            spotifyData.item.artists.forEach(artist => {
              autor += artist.name + ", ";
            });
          }

          spotifyData &&
            ComfyJS.Say(
              "@" + user + " " + title + " | " + autor + " " + url,
              extra.channel
            );
        }
      } catch (err) {
        console.log(`Error when use !song on twitch (${err})`);
      }
    }

    if (command == "playlist" || command == "playlista") {
      try {
        const spotifyData = await currentlyPlaying(extra.channel);

        let url = spotifyData.context.external_urls
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

    if (command == "next" && (flags.mod || flags.broadcaster)) {
      const { isPlayingNow } = songPlayingNow(extra.channel);
      if (isPlayingNow) {
        ComfyJS.Say("!skip", extra.channel);
        timeRequest(extra.channel, "skip");
      } else {
        nextSong(extra.channel);
      }
    }

    if (command == "weather") {
      try {
        const { temp, speed, description } = await getWeather(message);
        let emote;

        des

        console.log(emote);

        temp
          ? ComfyJS.Say(
              `@${user} Jest ${Math.round(
                temp - 273
              )} °C, witr wieje z prędkością ${speed} km/h jest ${description} ${emote} :sunny: , 🌤️ `,
              extra.channel
            )
          : ComfyJS.Say(`@${user} Nie znaleziono `, extra.channel);
      } catch (err) {
        console.log(`Error when use !playlist on twitch (${err})`);
      }
    }

    if (command === "dynamix" && (flags.mod || flags.broadcaster)) {
      ComfyJS.Say("Bot works!", extra.channel);
    }
  });

module.exports = {
  commands
};
