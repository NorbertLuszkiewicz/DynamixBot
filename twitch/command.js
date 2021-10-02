const ComfyJS = require("comfy.js");
const { currentlyPlaying, nextSong } = require("../spotify");
const { songPlayingNow, timeRequest } = require("./streamElements");

const commands = (ComfyJS.onCommand = (
  user,
  command,
  message,
  flags,
  extra
) => {
  if (command == "song") {
    currentlyPlaying(extra.channel, data => {
      songPlayingNow(extra.channel, function(songPlaying, title, url) {
        if (songPlaying) {
          ComfyJS.Say("@" + user + " " + title + " " + url, extra.channel);
        } else {
          let url = data.item.external_urls.spotify
            ? data.item.external_urls.spotify
            : "";
          let title = data.item.name ? data.item.name : "Nieznany tytł utworu";
          let autor = "";
          if (data.item.artists.length < 4 && data.item.artists.length > 0) {
            data.item.artists.forEach(artist => {
              autor += artist.name + ", ";
            });
          }

          data &&
            ComfyJS.Say(
              "@" + user + " " + title + " | " + autor + " " + url,
              extra.channel
            );
        }
      });
    });
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
