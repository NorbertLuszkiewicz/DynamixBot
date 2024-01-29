import ComfyJS from "comfy.js";
import { getWeather, getHoroscope, changeBadWords } from "./twitch";
import { getUserId, timeout, sendMessage, resolvePrediction } from "./helix";
import { tftMatchList, getLolMatchStats, getMatch, getStats, getRank } from "../../riot";
import { currentlyPlaying, nextSong, startSong, lastPlaying } from "../../spotify";
import { songPlayingNow, timeRequest, setSongAsPlay, lastSongPlaying } from "../../streamElements";
import { getChessUser, getLastGame } from "../../chess";
import { allWord, literalnieWord } from "../../literalnie";
import { getAllUser, updateUser, getUser } from "../../../controllers/UserController";

let users = {};
let usersWordle = {};

export const commands = () =>
  (ComfyJS.onCommand = async (user, command: string, message, flags, extra) => {
    try {
      const [data] = await getUser(extra.channel);
      const { commandSwitch, addSongID } = await data;

      if ((command == "song" || command == "coleci") && commandSwitch.song) {
        try {
          const spotifyData = await currentlyPlaying(extra.channel);
          const { isPlayingNow, title, link, userAdded } = await songPlayingNow(extra.channel);

          if (isPlayingNow) {
            ComfyJS.Say(`@${user} ${title} ${userAdded && " | dodał/a " + userAdded + " "} ${link} `, extra.channel);
          } else {
            let url = spotifyData?.item?.external_urls?.spotify ? spotifyData?.item?.external_urls?.spotify : "";
            let title = spotifyData?.item?.name ? spotifyData?.item?.name : "Nieznany tytuł utworu";
            let autor = "";
            if (spotifyData.item.artists.length > 0) {
              spotifyData.item.artists.forEach(artist => {
                autor += artist.name + ", ";
              });
            }

            spotifyData && ComfyJS.Say(`@${user} ${title} | ${autor} ${url}`, extra.channel);
          }
        } catch (err) {
          console.log(`Error when use !song on twitch (${err})`);
        }
      }

      if (flags.customReward && extra.customRewardId === addSongID) {
        ComfyJS.Say("!sr " + changeBadWords(message), extra.channel);
      }

      if (command == "lastsong" && commandSwitch.song) {
        try {
          const lastPlayingSpotify = await lastPlaying(extra.channel);
          const { isPlayingNow, title, link, userAdded } = await lastSongPlaying(extra.channel);

          if (isPlayingNow) {
            ComfyJS.Say(`@${user} ${title} ${userAdded && " | dodał/a " + userAdded + " "} ${link} `, extra.channel);
          } else {
            let url = lastPlayingSpotify.track.external_urls.spotify
              ? lastPlayingSpotify.track.external_urls.spotify
              : "";
            let title = lastPlayingSpotify.track.name ? lastPlayingSpotify.track.name : "Nieznany tytuł utworu";
            let autor = "";
            if (lastPlayingSpotify.track.artists.length > 0) {
              lastPlayingSpotify.track.artists.forEach(artist => {
                autor += artist.name + ", ";
              });
            }

            lastPlayingSpotify && ComfyJS.Say(`@${user} ${title} | ${autor} ${url}`, extra.channel);
          }
        } catch (err) {
          console.log(`Error when use !lastsong on twitch (${err})`);
        }
      }

      if ((command == "playlist" || command == "playlista") && commandSwitch.song) {
        try {
          const spotifyData = await currentlyPlaying(extra.channel);

          let url = spotifyData.context ? spotifyData.context.external_urls.spotify : "Nieznana Playlista";

          spotifyData && ComfyJS.Say(`@${user} aktualnie leci ta playlista: ${url} catJAM `, extra.channel);
        } catch (err) {
          console.log(`Error when use !playlist on twitch (${err})`);
        }
      }

      if ((command == "matches" || command == "mecze") && commandSwitch.tft) {
        try {
          const NickNameAndServer = message ? message.split(", ") : [null, null];

          let matchesList;
          if (data?.activeRiotAccount?.isLol) {
            matchesList = await getLolMatchStats(
              extra.channel,
              NickNameAndServer[0],
              NickNameAndServer[1] && NickNameAndServer[1].toUpperCase()
            );
          } else {
            matchesList = await tftMatchList(
              extra.channel,
              NickNameAndServer[0],
              NickNameAndServer[1] && NickNameAndServer[1].toUpperCase()
            );
          }

          ComfyJS.Say(`${matchesList}`, extra.channel);
        } catch (err) {
          console.log(`Error when use !mecze on twitch (${err})`);
        }
      }

      if (
        (command == "match" || command == "mecz") &&
        parseInt(message) > 0 &&
        parseInt(message) < 21 &&
        commandSwitch.tft
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
      if ((command == "match" || command == "mecz") && !message && commandSwitch.tft) {
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

      if ((command == "stats" || command == "staty") && commandSwitch.tft) {
        try {
          const NickNameAndServer = message ? message.split(", ") : [null, null];
          const stats = await getStats(
            extra.channel,
            NickNameAndServer[0],
            NickNameAndServer[1] && NickNameAndServer[1].toUpperCase()
          );

          ComfyJS.Say(changeBadWords(stats), extra.channel);
        } catch (err) {
          console.log(`Error when use !staty on twitch (${err})`);
        }
      }

      if ((command === "top" || command === "ranking") && commandSwitch.tft && !data.activeRiotAccount.isLol) {
        try {
          const stats = await getRank(extra.channel, message.toUpperCase());

          ComfyJS.Say(changeBadWords(stats), extra.channel);
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

      if ((command === "weather" || command === "pogoda") && commandSwitch.weather) {
        try {
          console.log("dddddasd");
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

          if (message.toLowerCase() != "niger" && message.toLowerCase() != "nigger") {
            temp
              ? ComfyJS.Say(
                  `@${user} Jest ${Math.round(
                    temp - 273
                  )} °C, ${description} ${emote} wiatr wieje z prędkością ${speed} km/h (${changeBadWords(message)})`,
                  extra.channel
                )
              : ComfyJS.Say(`@${user} Nie znaleziono`, extra.channel);
          }
        } catch (err) {
          console.log(`Error when use !pogoda on twitch (${err})`);
        }
      }

      if (command === "horoscope" || (command === "horoskop" && commandSwitch.weather)) {
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

      if (command === "lastWinners" || command === "wins") {
        const slots = data.slotsID;
        let result = "";

        slots.forEach(slot => {
          result =
            result +
            ` nazwa: ${slot.name} wynik: (${slot.wins}/${slot.times}) ${
              slot.lastWinners ? "ostatnio wygrali: (" + slot.lastWinners + ")" : ""
            } |`;
        });
        ComfyJS.Say(changeBadWords(result), extra.channel);
      }

      if (command === "wheelWinners" || command === "wheelwinners") {
        const wheelwinners = data.wheelwinners.toString();

        ComfyJS.Say(wheelwinners, extra.channel);
      }

      if (command === "slots" && commandSwitch.slots) {
        const emotes = ["", "VisLaud", "EZ", "peepoGlad", "Kappa", "okok", "BOOBA", "kezmanStare"];

        let number1 = randomInt(1, 7);
        let number2 = randomInt(1, 7);
        let number3 = randomInt(1, 7);

        let result = `__________________________________________________
      ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀[ ${emotes[number1]} | ${emotes[number2]} | ${emotes[number3]} ]/
      __________________________________________________
      `;

        const isWin = number1 === number2 && number2 === number3;
        const isSemiWin = number1 === number2 || number1 === number3 || number2 === number3;
        let winMessage = "przegrałeś PepeLaugh";
        isSemiWin && (winMessage = "prawie prawie PauseChamp");
        isWin && (winMessage = "wygrałeś BRUHBRUH");

        const now = new Date().getTime();

        const seySlots = () => {
          ComfyJS.Say(`${result} @${user} ${winMessage}`, extra.channel);
        };

        const checkDate = time => {
          if (time <= now) {
            users[user + extra.channel] = time + 60 * 1000 * 3;

            seySlots();
          }
        };

        const timeForUser = users[user + extra.channel];
        timeForUser ? checkDate(timeForUser) : checkDate(now);
      }
      const now = new Date().getTime();
      const canWrite = usersWordle[user + extra.channel] ? usersWordle[user + extra.channel].time <= now : true;

      if (
        command === "wordle" &&
        message.length === 5 &&
        allWord.includes(message.toLowerCase()) &&
        canWrite &&
        commandSwitch.wordle
      ) {
        let isWin = false;
        usersWordle[user + extra.channel]
          ? usersWordle[user + extra.channel]
          : (usersWordle[user + extra.channel] = {
              time: null,
              finalWord: "",
              messages: [],
              colorRow: [],
            });

        const number = randomInt(1, literalnieWord.length);
        let finalWord = usersWordle[user + extra.channel].finalWord
          ? usersWordle[user + extra.channel].finalWord
          : literalnieWord[number];

        let wordleResult = () => {
          const colorResult = [];
          for (let i = 0; i < 5; i++) {
            if (message.charAt(i) === finalWord.charAt(i)) {
              colorResult.push("🟩");
            } else if (finalWord.indexOf(message[i]) !== -1) {
              colorResult.push("🟨");
            } else {
              colorResult.push("⬜");
            }
          }
          isWin = JSON.stringify(colorResult) == JSON.stringify(["🟩", "🟩", "🟩", "🟩", "🟩"]);

          return colorResult.join(" ");
        };

        usersWordle[user + extra.channel].messages.push(message);
        usersWordle[user + extra.channel].colorRow.push(wordleResult() + "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀");
        usersWordle[user + extra.channel].finalWord = finalWord;

        let result = `__________________________________________________
      ${usersWordle[user + extra.channel].colorRow.join(" ")} 
      ${usersWordle[user + extra.channel].messages} @${user} ${isWin ? "wygrałeś BRUHBRUH " : ""}
       ${
         !isWin && usersWordle[user + extra.channel].messages.length === 5
           ? "przegrałeś PepeLaugh to była ostatnia próba"
           : ""
       }`;

        const seySlots = () => {
          ComfyJS.Say(`${changeBadWords(result)}`, extra.channel);

          if (usersWordle[user + extra.channel].messages.length === 5 || isWin) {
            usersWordle[user + extra.channel] = {
              time: now + 60 * 1000 * 10,
              finalWord: "",
              messages: [],
              colorRow: [],
            };
          }
        };

        const changeUserData = time => {
          if (time <= now) {
            seySlots();
          }
        };

        const timeForUser = usersWordle[user + extra.channel].time;

        timeForUser ? changeUserData(usersWordle[user + extra.channel].time) : changeUserData(now);

        console.log(user + " " + extra.channel, finalWord);
      }

      if (command === "wordle" && !message && commandSwitch.wordle) {
        ComfyJS.Say(
          `@${user} Musisz znaleźć ukryte 5 literowe słowo, żółte oznacza, że litera znajduje się w haśle, ale na innej pozycji, a zielone, że litera znajduje się na tej pozycji`,
          extra.channel
        );
      }
      if (command === "wordle" && message && !allWord.includes(message.toLowerCase()) && commandSwitch.wordle) {
        ComfyJS.Say(
          `@${user} Podałeś słowo, które nie zawiera 5 znaków albo nie znaleziono go w słowniku`,
          extra.channel
        );
      }

      //       if (command === "forma") {
      //         let number = randomInt(1, 100);

      //         ComfyJS.Say(
      //           `@${user} aktualnie jesteś w ${number}% swojej szczytowej formy`,
      //           extra.channel
      //         );
      //       }

      if ((command === "chessuser" || command === "szachista") && commandSwitch.chess) {
        try {
          const playerInfo = await getChessUser(message, extra.channel);

          ComfyJS.Say(`@${changeBadWords(user)} ${changeBadWords(playerInfo)}`, extra.channel);
        } catch (err) {
          console.log(`Error when use !user on twitch (${err})`);
        }
      }
      if (command === "chesslast" && commandSwitch.chess) {
        try {
          const gameInfo = await getLastGame(message, extra.channel);

          ComfyJS.Say(`@${changeBadWords(user)} ${changeBadWords(gameInfo)}`, extra.channel);
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

        const randomNumber = Math.floor(Math.random() * (Math.floor(answer.length - 1) + 1));

        ComfyJS.Say(answer[randomNumber], extra.channel);
      }

      if (command === "dynamix" && message !== "stop" && (flags.mod || flags.broadcaster)) {
        ComfyJS.Say("Bot works!", extra.channel);
      }
      if (command === "test" && (flags.mod || flags.broadcaster)) {
        console.log("test");

        const respose = await getLolMatchStats("dynam1x1", "MIodyBoss", "EUW");
        ComfyJS.Say(respose, extra.channel);
      }

      if (command === "start" && user === "DynaM1X1") {
        startSong(extra.channel);
      }
      if (command === "srplay" && (flags.mod || flags.broadcaster)) {
        setSongAsPlay(extra.channel, "play");
      }
      if (command === "testban" && (flags.mod || flags.broadcaster)) {
        timeout("testowy", 120, null, extra.channel);
        sendMessage("aaaaaa", "dynam1x1");
      }
      if (command === "srstop" && (flags.mod || flags.broadcaster)) {
        setSongAsPlay(extra.channel, "pause");
      }
      if (command.toLowerCase() === "resolveprediction" && (flags.mod || flags.broadcaster)) {
        resolvePrediction(message, extra.channel);
      }
      if (command === "testprediction" && (flags.mod || flags.broadcaster)) {
        resolvePrediction(message, "overpow");
      }

      if ((command === "on" || command === "off") && (flags.mod || flags.broadcaster)) {
        let newComandSwitch = commandSwitch;

        const isOn = command === "on";
        const onOffMessage = isOn ? "Włączono" : "Wyłączono";

        if (message === "weather" || message === "pogoda" || message === "horoskop") {
          newComandSwitch.weather = isOn;
          ComfyJS.Say(`${changeBadWords(onOffMessage)} komendy pogoda i horoskop`, extra.channel);
        }

        if (
          message === "tft" ||
          message === "stats" ||
          message === "ranking" ||
          message === "mecze" ||
          message === "mecz" ||
          message === "rank" ||
          message === "match" ||
          message === "riot" ||
          message === "matches"
        ) {
          newComandSwitch.tft = isOn;
          ComfyJS.Say(`${onOffMessage} komendy riot: stats, ranking, mecze, mecz`, extra.channel);
        }

        if (message === "chess" || message === "chessuser" || message === "szachista" || message === "chesslast") {
          newComandSwitch.chess = isOn;
          ComfyJS.Say(`${onOffMessage} komendy chess: chessuser, chesslast`, extra.channel);
        }

        if (message === "wordle") {
          newComandSwitch.wordle = isOn;
          ComfyJS.Say(`${onOffMessage} komende wordle`, extra.channel);
        }

        if (message === "slots") {
          newComandSwitch.slots = isOn;
          ComfyJS.Say(`${onOffMessage} komende slots`, extra.channel);
        }

        if (message === "song" || message === "playlist" || message === "playlista") {
          newComandSwitch.song = isOn;
          ComfyJS.Say(`${onOffMessage} komendy song, playlist`, extra.channel);
        }

        updateUser({
          streamer: extra.channel,
          commandSwitch: newComandSwitch,
        });
      }
    } catch (err) {
      console.log("Error when use commands" + err);
    }
  });

function randomInt(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const toPl = string => {
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
