import ComfyJS from "comfy.js";
import { getWeather, getHoroscope } from "./twitch";
import { changeBadWords } from "../../../helpers";
import { resolvePrediction } from "./helix";
import { getLolMatchStats, getLolMatch, getLolUserStats } from "../../riot/lol";
import { tftMatchList, getMatch, getStats, getRank, resetRiotName } from "../../riot/tft";
import { currentlyPlaying, nextSong, startSong, lastPlaying } from "../../spotify";
import { songPlayingNow, timeRequest, setSongAsPlay, lastSongPlaying } from "../../streamElements";
import { getChessUser, getLastGame } from "../../chess";
import { allWord, literalnieWord } from "../../literalnie";
import { getCommand, updateCommand } from "../../../controllers/CommandController";
import { getSong } from "../../../controllers/SongController";
import { plToEnAlphabet, randomInt } from "../../../helpers";
import { getRiot } from "../../../controllers/RiotController";

let users = {};
let usersWordle = {};
let reminder = {
  kezman22: { message: "MAGICZNE SŁOWO DLA INSTREAMLY POLICE", isActive: false },
  dynam1x1: { message: "PTAKI LATAJĄ KLUCZEM POLICE", isActive: false },
};
let internal = {};

export const commands = () =>
  (ComfyJS.onCommand = async (user: string, command: string, message: string, flags, extra) => {
    try {
      const [{ commandSwitch, wheelwinners, slotsID }] = await getCommand(extra.channel);
      const [{ activeRiotAccount }] = await getRiot(extra.channel);
      const [{ addSongID }] = await getSong(extra.channel);

      if ((command === "song" || command === "coleci") && commandSwitch.song) {
        try {
          const spotifyData = await currentlyPlaying(extra.channel);
          const { title, link, userAdded } = await songPlayingNow(extra.channel);

          if (!spotifyData?.is_playing) {
            ComfyJS.Say(`@${user} ${title} ${userAdded && " | dodał/a " + userAdded + " "} ${link} `, extra.channel);
          } else {
            let url = spotifyData?.item?.external_urls?.spotify ? spotifyData?.item?.external_urls?.spotify : "";
            let title = spotifyData?.item?.name ? spotifyData?.item?.name : "Nieznany tytuł utworu";
            let autor = "";
            if (spotifyData.item?.artists?.length > 0) {
              spotifyData.item?.artists?.forEach(artist => {
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
          const spotifyData = await currentlyPlaying(extra.channel);
          const lastPlayingSpotify = await lastPlaying(extra.channel);
          const { title, link, userAdded } = await lastSongPlaying(extra.channel);

          if (!spotifyData?.is_playing) {
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

      if (
        (command === "matches" || command === "mecze" || command === "meczelol" || command === "meczetft") &&
        commandSwitch.tft
      ) {
        try {
          const NickNameAndServer = message ? message.split(", ") : [null, null];
          const props = [
            extra.channel,
            NickNameAndServer[0],
            NickNameAndServer[1] && NickNameAndServer[1].toUpperCase(),
          ];
          let matchesList;
          switch (command) {
            case "meczelol": {
              matchesList = await getLolMatchStats(props[0], props[1], props[2]);
              break;
            }
            case "meczetft": {
              matchesList = await tftMatchList(props[0], props[1], props[2]);
              break;
            }
            default: {
              if (activeRiotAccount?.isLol) {
                matchesList = await getLolMatchStats(props[0], props[1], props[2]);
              } else {
                matchesList = await tftMatchList(props[0], props[1], props[2]);
              }
              break;
            }
          }

          ComfyJS.Say(`${matchesList}`, extra.channel);
        } catch (err) {
          console.log(`Error when use !mecze on twitch (${err})`);
        }
      }

      if (command.toLocaleLowerCase() === "resetriotname" && (flags.mod || flags.broadcaster)) {
        resetRiotName(extra.channel);
      }

      if (
        (command == "match" || command == "mecz" || command == "mecztft" || command == "meczlol") &&
        message &&
        commandSwitch.tft
      ) {
        try {
          const nickNameAndServer = message.split(", ");
          const props = {
            number: nickNameAndServer?.[0] ? parseInt(nickNameAndServer[0]) : 999,
            nickname: nickNameAndServer?.[1],
            server: nickNameAndServer?.[2] && nickNameAndServer[2].toUpperCase(),
          };
          let match;

          if (props.number) {
            switch (command) {
              case "meczlol": {
                match = await getLolMatch(props.number, props.nickname, props.server, extra.channel);
                break;
              }
              case "mecztft": {
                match = await getMatch(props.number, props.nickname, props.server, extra.channel);
                break;
              }
              default: {
                if (activeRiotAccount?.isLol) {
                  match = await getLolMatch(props.number, props.nickname, props.server, extra.channel);
                } else {
                  match = await getMatch(props.number, props.nickname, props.server, extra.channel);
                }
                break;
              }
            }
          }
          ComfyJS.Say(`@${user} ${match}`, extra.channel);
        } catch (err) {
          console.log(`Error when use !mecz on twitch (${err})`);
        }
      }

      if (command == "next" && (flags.mod || flags.broadcaster)) {
        const spotifyData = await currentlyPlaying(extra.channel);

        if (spotifyData?.is_playing) {
          nextSong(extra.channel);
        } else {
          ComfyJS.Say("!skip", extra.channel);
          timeRequest(extra.channel, "skip");
        }
      }

      if (
        (command === "stats" || command === "staty" || command === "statylol" || command === "statytft") &&
        commandSwitch.tft
      ) {
        try {
          const NickNameAndServer = message ? message.split(", ") : [null, null];
          let stats;

          switch (command) {
            case "statylol": {
              stats = await getLolUserStats(extra.channel, NickNameAndServer[0], NickNameAndServer[1]?.toUpperCase());
              break;
            }
            case "statytft": {
              stats = await getStats(extra.channel, NickNameAndServer[0], NickNameAndServer[1]?.toUpperCase());
              break;
            }
            default: {
              if (activeRiotAccount?.isLol) {
                stats = await getLolUserStats(extra.channel, NickNameAndServer[0], NickNameAndServer[1]?.toUpperCase());
              } else {
                stats = await getStats(extra.channel, NickNameAndServer[0], NickNameAndServer[1]?.toUpperCase());
              }
              break;
            }
          }

          ComfyJS.Say(changeBadWords(stats), extra.channel);
        } catch (err) {
          console.log(`Error when use !staty on twitch (${err})`);
        }
      }

      if ((command === "top" || command === "ranking") && commandSwitch.tft && !activeRiotAccount.isLol) {
        try {
          const stats = await getRank(message.toUpperCase());

          ComfyJS.Say(changeBadWords(stats), extra.channel);
        } catch (err) {
          console.log(`Error when use !top on twitch (${err})`);
        }
      }

      if (command === "next" && (flags.mod || flags.broadcaster)) {
        const spotifyData = await currentlyPlaying(extra.channel);

        if (spotifyData?.is_playing) {
          nextSong(extra.channel);
        } else {
          ComfyJS.Say("!skip", extra.channel);
          timeRequest(extra.channel, "skip");
        }
      }

      if ((command === "przypominacz" || command === "reminder") && (flags.mod || flags.broadcaster)) {
        clearInterval(internal[extra.channel]);
        clearInterval(internal[extra.channel]);
        if (message.toLowerCase() === "on") {
          reminder[extra.channel].isActive = true;
        } else if (message.toLowerCase() === "off") {
          reminder[extra.channel].isActive = false;
        } else {
          reminder[extra.channel].message = message;
        }

        if (reminder[extra.channel].isActive) {
          internal[extra.channel] = setInterval(
            () => ComfyJS.Say(reminder[extra.channel].message, extra.channel),
            16 * 1000 * 60
          );
        } else {
          clearInterval(internal[extra.channel]);
        }
      }

      if ((command === "weather" || command === "pogoda") && commandSwitch.weather) {
        try {
          const { temp, speed, description } = await getWeather(plToEnAlphabet(message));

          const weatherIcon = {
            bezchmurnie: "☀️",
            pochmurnie: "🌥️",
            "zachmurzenie małe": "🌤️",
            "zachmurzenie umiarkowane": "🌥️",
            "zachmurzenie duże": "☁️",
            mgła: "🌫️",
            zamglenia: "🌫️",
            "umiarkowane opady deszczu": "🌧️",
            "słabe opady deszczu": "🌧️",
          };

          if (temp) {
            ComfyJS.Say(
              `@${user} Jest ${Math.round(temp - 273)} °C, ${description} ${
                weatherIcon[description] || ""
              } wiatr wieje z prędkością ${speed} km/h (${changeBadWords(message)})`,
              extra.channel
            );
          } else {
            ComfyJS.Say(`@${user} Nie znaleziono`, extra.channel);
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

          const description = await getHoroscope(changeToEng[plToEnAlphabet(message)]);

          description
            ? ComfyJS.Say(`@${user} ${description}`, extra.channel)
            : ComfyJS.Say(`@${user} Nie znaleziono`, extra.channel);
        } catch (err) {
          console.log(`Error when use !horoskop on twitch (${err})`);
        }
      }

      if (command === "lastWinners" || command === "wins") {
        const slots = slotsID;
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

      if (command.toString() === "wheelwinners") {
        const winners = wheelwinners.toString();

        ComfyJS.Say(winners, extra.channel);
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
        usersWordle[user + extra.channel].colorRow.push(wordleResult() + "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀");
        usersWordle[user + extra.channel].finalWord = finalWord;

        let result = `_________________________________________________
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

      if (command === "forma") {
        let number = randomInt(1, 100);

        ComfyJS.Say(`@${user} aktualnie jesteś w ${number}% swojej szczytowej formy`, extra.channel);
      }

      if ((command === "chessuser" || command === "szachista") && commandSwitch.chess) {
        try {
          const playerInfo = await getChessUser(message);

          ComfyJS.Say(`@${changeBadWords(user)} ${changeBadWords(playerInfo)}`, extra.channel);
        } catch (err) {
          console.log(`Error when use !user on twitch (${err})`);
        }
      }
      if (command === "chesslast" && commandSwitch.chess) {
        try {
          const gameInfo = await getLastGame(message);

          ComfyJS.Say(`@${changeBadWords(user)} ${changeBadWords(gameInfo)}`, extra.channel);
        } catch (err) {
          console.log(`Error when use !user on twitch (${err})`);
        }
      }

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

      if (command === "start" && user === "DynaM1X1") {
        startSong(extra.channel);
      }
      if (command === "srplay" && (flags.mod || flags.broadcaster)) {
        setSongAsPlay(extra.channel, "play");
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

        updateCommand({
          streamer: extra.channel,
          commandSwitch: newComandSwitch,
        });
      }
    } catch (err) {
      console.log("Error when use commands" + err);
    }
  });
