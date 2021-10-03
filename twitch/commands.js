const ComfyJS = require("comfy.js");
const { currentlyPlaying, nextSong } = require("../spotify");
const { songPlayingNow, timeRequest } = require("../streamElements");

const commands = () =>
  (ComfyJS.onCommand = async (user, command, message, flags, extra) => {
    if (command == "song") {
      try {
        const spotifyData = await currentlyPlaying(extra.channel);

        songPlayingNow(extra.channel, function(songPlaying, title, url) {
          if (songPlaying) {
            ComfyJS.Say("@" + user + " " + title + " " + url, extra.channel);
          } else {
            let url = spotifyData.item.external_urls.spotify
              ? spotifyData.item.external_urls.spotify
              : "";
            let title = spotifyData.item.name
              ? spotifyData.item.name
              : "Nieznany tytł utworu";
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
        });
        console.log(spotifyData);
      } catch (err) {
        console.log(`Error when use !song on twitch (${err})`);
      }
    }

    if (command == "playlist" || command == "playlista") {
      currentlyPlaying(extra.channel, data => {
        let url = data.context.external_urls.spotify
          ? data.context.external_urls.spotify
          : "Nieznana Playlista";

        data &&
          ComfyJS.Say(
            "@" + user + " aktualnie leci ta playlista: " + url + " catJAM ",
            extra.channel
          );
      });
    }

    if (command == "next" && (user === "DynaM1X1" || flags.broadcaster)) {
      songPlayingNow(extra.channel, function(songPlaying) {
        if (songPlaying) {
          ComfyJS.Say("!skip", extra.channel);
          timeRequest(extra.channel, "skip");
        } else {
          nextSong(extra.channel);
        }
      });
    }
  });

module.exports = {
  commands
};
