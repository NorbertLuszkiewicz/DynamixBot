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
const { getChessUser, getLastGame } = require("../chess");

let users = {};

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

    if (command === "weather" || command === "pogoda") {
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
  
    if (command === "horoscope" || command === "horoskop") {
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

    if (command === "kutas" || command === "penis") {
      let number = randomInt(1, 9);
      let emote = "";

      number < 4 && (emote = "PepeLaugh");
      number >= 4 && number <= 6 && (emote = "kezmanGlad");
      number > 6 && (emote = "VisLaud ");

      ComfyJS.Say(`@${user} 8${"=".repeat([number])}D ${emote}`, extra.channel);
    }

    if (command === "slots" && extra.channel !== "kezman22") {
      const emotes = [
        "",
        "VisLaud",
        "EZ",
        "peepoGlad",
        "Kappa",
        "okok",
        "BOOBA",
        "kezmanStare",
      ];

      let number1 = randomInt(1, 7);
      let number2 = randomInt(1, 7);
      let number3 = randomInt(1, 7);

      let result = `__________________________________________________
      --------------[ ${emotes[number1]} | ${emotes[number2]} | ${emotes[number3]} ]/
      __________________________________________________
      `;

      const isWin = number1 === number2 && number2 === number3;
      const isSemiWin =
        number1 === number2 || number1 === number3 || number2 === number3;
      let winMessage = "przegrałeś PepeLaugh";
      isSemiWin && (winMessage = "prawie prawie PauseChamp");
      isWin && (winMessage = "wygrałeś BRUHBRUH");

      const now = new Date().getTime();

      const seySlots = () => {
        ComfyJS.Say(`${result} @${user} ${winMessage}`, extra.channel);
      };

      const checkDate = (time) => {
        if (time <= now) {
          users[user + extra.channel] = time + (60 * 1000 * 3);
          seySlots();
        }
      };

      const timeForUser = users[user + extra.channel];
      timeForUser ? checkDate(timeForUser) : checkDate(now);

      console.log(users);
    }
    
    if (command === "wordle" ) { 

      let number1 = randomInt(1, 7);
      let number2 = randomInt(1, 7);
      let number3 = randomInt(1, 7);

      let result = `__________________________________________________
      --------------[ ${emotes[number1]} | ${emotes[number2]} | ${emotes[number3]} ]/
      __________________________________________________
      `;

      const isWin = number1 === number2 && number2 === number3;
      const isSemiWin =
        number1 === number2 || number1 === number3 || number2 === number3;
      let winMessage = "przegrałeś PepeLaugh";
      isSemiWin && (winMessage = "prawie prawie PauseChamp");
      isWin && (winMessage = "wygrałeś BRUHBRUH");

      const now = new Date().getTime();

      const seySlots = () => {
        ComfyJS.Say(`${result} @${user} ${winMessage}`, extra.channel);
      };

      const checkDate = (time) => {
        if (time <= now) {
          users[user + extra.channel] = time + (60 * 1000 * 3);
          seySlots();
        }
      };

      const timeForUser = users[user + extra.channel];
      timeForUser ? checkDate(timeForUser) : checkDate(now);

      console.log(users);
    }

    if (command === "forma") {
      let number = randomInt(1, 100);

      ComfyJS.Say(
        `@${user} aktualnie jesteś w ${number}% swojej szczytowej formy`,
        extra.channel
      );
    }
    
    if (command === "chessuser" || command === "szachista" ) {
      try {
        const playerInfo = await getChessUser(
          message,
          extra.channel
        );
        
        

        ComfyJS.Say(`@${user} ${playerInfo}`, extra.channel);
      } catch (err) {
        console.log(`Error when use !user on twitch (${err})`);
      }    
    }
    if (command === "chesslast" ) {
      try {
        const gameInfo = await getLastGame(
          message,
          extra.channel
        );
        
        

        ComfyJS.Say(`@${user} ${gameInfo}`, extra.channel);
      } catch (err) {
        console.log(`Error when use !user on twitch (${err})`);
      }
    }

    ///PAULINKA STOP

    if (command === "dynamix" && message == "stop" && user == "paaulinnkaa") {
      const answer = [
        "@paaulinnkaa próba wyłączenia bota nie powiodła się",
        "@paaulinnkaa nigdy mnie nie wyłączysz buahaha",
        "intruz próba wyłączenia bota przerwana czy zbanować użytkownika @paaulinnkaa?",
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

function randomInt(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

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
