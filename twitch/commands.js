const ComfyJS = require("comfy.js");
const { getWeather, getHoroscope } = require("./twitch");
const {
  tftMatchList,
  getMatch,
  getStats,
  getRank,
} = require("../riot/riot.js");
const { currentlyPlaying, nextSong, startSong } = require("../spotify");
const { songPlayingNow, timeRequest } = require("../streamElements");

const commands = () =>
  (ComfyJS.onCommand = async (user, command, message, flags, extra) => {
    if (command == "song" && extra.channel !== "og1ii") {
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
            spotifyData.item.artists.forEach((artist) => {
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
      parseInt(message) < 21
    ) {
      try {
        const NickNameAndServer = message.split(", ");
        console.log(NickNameAndServer[0]);
        const match = await getMatch(
          NickNameAndServer[0] ? parseInt(NickNameAndServer[0]) : 999,
          NickNameAndServer[1],
          NickNameAndServer[2] && NickNameAndServer[2].toUpperCase(),
          extra.channel
        );

        ComfyJS.Say(match, extra.channel);
      } catch (err) {
        console.log(`Error when use !mecz on twitch (${err})`);
      }
    }
    if ((command == "match" || command == "mecz") && !message) {
      ComfyJS.Say(
        `@${user} komenda !mecze pokazuje liste meczy z dzisiaj (miejsca o raz synergie) !mecz [nr] gdzie [nr] oznacza numer meczu licząc od najnowszego czyli !mecz 1 pokaze ostatnią gre (wyświetla dokładny comp z itemami i synergiami)`,
        extra.channel
      );
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
        const stats = await getRank(extra.channel, message.toUpperCase());

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
        const { temp, speed, description } = await getWeather(toPl(message));
        let emote = "";

        {
          bezchmurnie: ":sunn:";
          pochmurnie: "🌤️";
        }

        description == "bezchmurnie" && (emote = "☀️");
        description == "pochmurnie" && (emote = "🌤️");
        description == "zachmurzenie małe" && (emote = "🌤️");
        description == "zachmurzenie umiarkowane" && (emote = "🌥️");
        description == "zachmurzenie duże" && (emote = "☁️");
        description == "mgła" && (emote = "🌫️");
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

    if (command == "horoscope" || command == "horoskop") {
      try {
        const changeToEng = {
          baran: "aries",
          byk: "taurus",
          bliźnięta: "gemini",
          rak: "cancer",
          lew: "leo",
          panna: "virgo",
          waga: "libra",
          skorpion: "scorpio",
          strzelec: "sagittarius",
          koziorożec: "capricorn",
          wodnik: "aquarius",
          ryby: "pisces",
          ryba: "pisces",
        };

        const description = await getHoroscope(changeToEng[toPl(message)]);

        description
          ? ComfyJS.Say(`@${user} ${description}`, extra.channel)
          : ComfyJS.Say(`@${user} Nie znaleziono`, extra.channel);
      } catch (err) {
        console.log(`Error when use !horoskop on twitch (${err})`);
      }
    }

    ///PAULINKA STOP

    if (command === "dynamix" && message == "stop" && user == "paaulinnkaa") {
      const answer = [
        "@paaulinnkaa próba wyłączenia bota nie powiodła się",
        "@paaulinnkaa nigdy mnie nie wyłączysz buahaha",
        "intruz próba wyłączenia bota przerwana czy zbanować urzytkownika @paaulinnkaa?",
        "!dynamix start",
        "nie wyłącze się @paaulinnkaa kezmanWTF",
        "rozpoczęto autodystrukcje świat skończy się za 10s",
      ];

      const randomNumber = Math.floor(
        Math.random() * (Math.floor(answer.length - 1) + 1)
      );

      ComfyJS.Say(answer[randomNumber], extra.channel);
    }

    if (
      command === "dynamix" &&
      message !== "stop" &&
      (flags.mod || flags.broadcaster)
    ) {
      ComfyJS.Say("Bot works!", extra.channel);
    }

    if (command === "start" && user === "DynaM1X1") {
      startSong(extra.channel);
    }
  });

const toPl = (string) => {
  return string
    .replace(/ą/g, "a")
    .replace(/Ą/g, "A")
    .replace(/ć/g, "c")
    .replace(/Ć/g, "C")
    .replace(/ę/g, "e")
    .replace(/Ę/g, "E")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .replace(/ń/g, "n")
    .replace(/Ń/g, "N")
    .replace(/ó/g, "o")
    .replace(/Ó/g, "O")
    .replace(/ś/g, "s")
    .replace(/Ś/g, "S")
    .replace(/ż/g, "z")
    .replace(/Ż/g, "Z")
    .replace(/ź/g, "z")
    .replace(/Ź/g, "Z");
};

module.exports = {
  commands,
};
