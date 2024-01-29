const { nextSong, pauseSong, startSong, refreshDevices, changeVolumeOnTime, setVolume } = require("../spotify");

const { getAllUser, updateUser, getUser } = require("../controllers/UserController.js.js");

const { songPlayingNow, timeRequest, removeBlockedSong } = require("../streamElements");

const { changeBadWords } = require("./twitch");
const { timeout } = require("./helix");

const ComfyJS = require("comfy.js");

let timeCooldownTravis = 0;
let timeCooldownOgiii = 0;

let timeoutVolume = { kezman22: null, dynam1x1: null };

const setTimeoutVolume = async () => {
  try {
    const allUsers = await getAllUser();
    timeoutVolume = allUsers.reduce((acc, key) => ({ ...acc, [key.streamer]: null }), {});
  } catch {
    console.log("Error when call setTimeoutVolume");
  }
};

const messages = () => {
  ComfyJS.onChat = async (user, message, flags, self, extra) => {
    try {
      const [data] = await getUser(extra.channel);
      const { addSongID, skipSongID, volumeSongID, rollID, banID, slotsID } = await data;

      if (flags.customReward && message === "add-song-award" && (flags.mod || flags.broadcaster)) {
        updateUser({
          streamer: extra.channel,
          addSongID: extra.customRewardId,
        });

        ComfyJS.Say("Włączono automatyczne dodawanie piosenki przy zakupie tej nagrody", extra.channel);
      }

      if (flags.customReward && message === "skip-song-award" && (flags.mod || flags.broadcaster)) {
        updateUser({
          streamer: extra.channel,
          skipSongID: extra.customRewardId,
        });

        ComfyJS.Say("Włączono automatyczne pomijanie piosenki przy zakupie tej nagrody", extra.channel);
      }

      if (flags.customReward && message === "change-volume-song-award" && (flags.mod || flags.broadcaster)) {
        const newVolumeSongID = volumeSongID;
        newVolumeSongID.id = extra.customRewardId;

        updateUser({
          streamer: extra.channel,
          volumeSongID: newVolumeSongID,
        });

        ComfyJS.Say("Włączono automatyczą zmiane głosności przy zakupie tej nagrody", extra.channel);
      }

      const slots = slotsID.find(slots => slots.name.toLowerCase() === message.toLowerCase());

      if (flags.customReward && slots && (flags.mod || flags.broadcaster)) {
        const updateSlots = slotsID.map(item => {
          if (item.name.toLowerCase() === slots.name.toLowerCase()) {
            item.id = extra.customRewardId;
          }

          return item;
        });

        updateUser({
          streamer: extra.channel,
          slotsID: updateSlots,
        });

        ComfyJS.Say(`Włączono Slots dla nagrody "${slots.name}"`, extra.channel);
      }

      if (flags.customReward && extra.customRewardId === addSongID) {
        ComfyJS.Say("!sr " + changeBadWords(message), extra.channel);
      }

      if (flags.customReward && extra.customRewardId === rollID) {
        ComfyJS.Say(`${user} rolls the dice and gets a ${randomIntFromInterval(1, 420)}!`, extra.channel);
      }

      if (flags.customReward && extra.customRewardId === banID) {
        let number = randomIntFromInterval(1, 100);

        if (number == 1) {
          timeout(user, 1, "t/o z nagrody kanału", extra.channel);
          ComfyJS.Say(`${user} brawo trafiłeś w 1% na 10s t/o OOOO`, extra.channel);
        }

        if (number > 1 && number < 89) {
          ComfyJS.Say(`${user} brawo trafiłeś w 88% na 30min t/0 PeepoGlad`, extra.channel);
          timeout(user, 1800, "t/o z nagrody kanału", extra.channel);
        }
        if (number > 88 && number < 100) {
          ComfyJS.Say(`${user} brawo trafiłeś w 10% na 1h t/0 EZ`, extra.channel);
          timeout(user, 3600, "t/o z nagrody kanału", extra.channel);
        }
        if (number == 100) {
          ComfyJS.Say(`${user} brawo trafiłeś w 1% na perma KEKW`, extra.channel);
          timeout(user, null, "t/o z nagrody kanału", extra.channel);
        }
      }

      let reward = slotsID.find(slots => slots.id === extra.customRewardId);

      if (flags.customReward && reward) {
        const emotes = [
          "",
          "VisLaud",
          "EZ",
          "peepoGlad",
          "Kappa",
          "okok",
          "BOOBA",
          "kezmanStare",
          "catJAM",
          "SUSSY",
          "OOOO",
          "BRUHBRUH",
          "overD",
          "zyzzBass",
          "LIKE",
          "Sadge",
        ];

        const maxNumber = reward ? reward.emotes : 7;

        let number1 = randomInt(1, maxNumber);
        let number2 = randomInt(1, maxNumber);
        let number3 = randomInt(1, maxNumber);

        if (reward.id == "2ac9a80d-9891-492a-b803-d55616873244") {
          number3 = number2;
        }

        let result = `____________________PREMIUM____________________
      ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀[ ${emotes[number1]} | ${emotes[number2]} | ${emotes[number3]} ]/
      __________________________________________________
      `;

        const isWin = number1 === number2 && number2 === number3;
        const isSemiWin = number1 === number2 || number1 === number3 || number2 === number3;
        let winMessage = "przegrałeś PepeLaugh";
        isSemiWin && (winMessage = "prawie prawie PauseChamp");
        isWin && (winMessage = "wygrałeś BRUHBRUH @" + extra.channel);

        ComfyJS.Say(`${result} @${user} ${winMessage}`, extra.channel);

        if (!isWin && reward.id == "2ac9a80d-9891-492a-b803-d55616873244") {
          timeout(user, 600, "t/o z nagrody kanału", extra.channel);
        } else if (isWin && reward.id == "2ac9a80d-9891-492a-b803-d55616873244") {
          timeout(message, 600, "t/o z nagrody kanału", extra.channel);
        } else if (reward.withBan && !isWin) {
          if (!isSemiWin && maxNumber > 3) {
            timeout(user, 600, "t/o z nagrody kanału", extra.channel);
          }
          if (isSemiWin && maxNumber <= 3) {
            timeout(user, 600, "t/o z nagrody kanału", extra.channel);
          }
          if (isSemiWin && maxNumber > 3 && extra.channel.toLowerCase() === "kezman22") {
            timeout(user, 600, "t/o z nagrody kanału", extra.channel);
          }
        }

        let slitsIDChanged = slotsID.map(item => {
          if (item.id === reward.id) {
            item.times += 1;
            if (isWin) {
              item.wins += 1;
              if (item.lastWinners) {
                item.lastWinners.push(user);
                item.lastWinners.length > 3 && item.lastWinners.splice(0, 1);
              } else {
                item.lastWinners = [user];
              }
            }
          }

          return item;
        });

        updateUser({
          streamer: extra.channel,
          slotsID: slitsIDChanged,
        });
      }

      if (
        user === "StreamElements" &&
        (message.lastIndexOf("to the queue") != -1 || message.lastIndexOf("do kolejki") != -1)
      ) {
        if (extra.channel !== "overpow") {
          pauseSong(extra.channel);
        }

        const removedSongList = await removeBlockedSong(extra.channel);

        if (removedSongList.length > 0) {
          removedSongList.forEach(x => {
            ComfyJS.Say(`@${changeBadWords(x.user)} ${changeBadWords(x.title)} | ${x.reason}`, extra.channel);
          });
        }
      }

      if (flags.customReward && extra.customRewardId === skipSongID) {
        const { isPlayingNow } = await songPlayingNow(extra.channel);

        if (isPlayingNow) {
          ComfyJS.Say("!skip", extra.channel);
          await timeRequest(extra.channel, "skip");
        } else {
          nextSong(extra.channel);
        }
      }

      const { id, min, max, minSR, maxSR, time } = volumeSongID
        ? volumeSongID
        : {
            id: null,
            min: null,
            max: null,
            minSR: null,
            maxSR: null,
            time: null,
          };

      if (volumeSongID && flags.customReward && extra.customRewardId === id) {
        ComfyJS.Say("!volume " + maxSR, extra.channel);
        changeVolumeOnTime(extra.channel, min, max, time);
        let [user] = await getUser(extra.channel);

        let newMaxVolumeTime = 0;
        let now = Date.now();

        if (user.maxVolumeTime > now) {
          newMaxVolumeTime = user.maxVolumeTime + time;
        }

        if (!user.maxVolumeTime || user.maxVolumeTime < now) {
          newMaxVolumeTime = now + time;
        }

        await updateUser({
          streamer: extra.channel,
          maxVolumeTime: newMaxVolumeTime,
        });

        clearTimeout(timeoutVolume[extra.channel]);
        timeoutVolume[extra.channel] = setTimeout(() => {
          ComfyJS.Say("!volume " + minSR, extra.channel);
        }, newMaxVolumeTime - now);
      }

      if (message == "skip" && user === "DynaM1X1") {
        try {
          const { isPlayingNow } = await songPlayingNow(extra.channel);
          if (isPlayingNow) {
            ComfyJS.Say("!skip", extra.channel);
            await timeRequest(extra.channel, "skip");
          } else {
            nextSong(extra.channel);
          }
        } catch (err) {
          console.log(`Error when skip song ${err}`);
        }
      }
    } catch (err) {
      console.log(`Error when use message ${err}`);
    }

    if (message === "pause" && user === "DynaM1X1") {
      pauseSong(extra.channel);
    }

    if (message === "device" && user === "DynaM1X1") {
      refreshDevices(extra.channel);
    }

    //usuwa Xd

    //     if (extra.channel == "kezman22") {
    //       const splitMessage = message.split(" ");

    //       splitMessage.forEach((x) => {
    //         if (
    //           (x.indexOf("Xd") !== -1 && x.length > 2) ||
    //           x.indexOf("X d") !== -1
    //         ) {
    //           ComfyJS.Say("/timeout " + user + " 1", extra.channel);
    //         }
    //       });
    //     }

    //cyferki

    // if (
    //   (message.indexOf(" cyferki") !== -1 ||
    //     message.indexOf(" numerki") !== -1 ||
    //     message.indexOf(" liczby") !== -1) &&
    //   user != "DynaM1X1" &&
    //   user != "StreamElements"
    // ) {
    //   ComfyJS.Say(
    //     user +
    //       " to nakładka która pokazuje na kogo grałeś: https://www.metatft.com/download peepoGlad",
    //     extra.channel
    //   );
    // }

    //strzelanie do tosi

    if (
      (message.indexOf("gun l2plelTosia") !== -1 || message.indexOf("Gun l2plelTosia") !== -1) &&
      user != "DynaM1X1" &&
      user != "StreamElements"
    ) {
      ComfyJS.Say(`l2plelTosia overGun ${user}`, extra.channel);
      timeout(user, 60, "strzelał do tosi", extra.channel);
    }

    ///META

    //     const usedCo = message.toLowerCase().indexOf("co") !== -1;
    //     const usedMocne = message.toLowerCase().indexOf("mocne") !== -1;
    //     const usedMecie = message.toLowerCase().indexOf("mecie") !== -1;
    //     const usedDobre = message.toLowerCase().indexOf("dobre") !== -1;
    //     const usedOP = message.toLowerCase().indexOf("op") !== -1;
    //     const usedTeraz = message.toLowerCase().indexOf("teraz") !== -1;
    //     const usedSilne = message.toLowerCase().indexOf("silne") !== -1;
    //     const usedKaruzela =
    //       message.toLowerCase().indexOf("karuzela") !== -1 ||
    //       message.toLowerCase().indexOf("karuzeli") !== -1;
    //     const usedItem = message.toLowerCase().indexOf("item") !== -1;
    //     const usedcoMocne = message.toLowerCase().indexOf("co mocne") !== -1;
    //     const usedGrac =
    //       message.toLowerCase().indexOf("grac") !== -1 ||
    //       message.toLowerCase().indexOf("grać") !== -1;

    //     if (
    //       usedCo &&
    //       usedTeraz &&
    //       usedGrac &&
    //       (usedMocne || usedMecie || usedDobre || usedSilne|| usedOP) &&
    //       !usedKaruzela &&
    //       !usedItem
    //       || usedcoMocne
    //     ) {
    //       const answer = [
    //         `@${user} aktualnie meta się tworzy więc nie wiadomo`,
    //         `@${user} nie dawno wyszedł patch więc jeszcze nie wiemy`,
    //         `@${user} na razie można spekulować popatrz na metatft, oraz na to co grała topka`,
    //       ];

    //       const randomNumber = Math.floor(
    //         Math.random() * (Math.floor(answer.length - 1) + 1)
    //       );

    //       ComfyJS.Say(answer[randomNumber], extra.channel);
    //     }

    ///JUŻ NA LIVE

    //     const usedJuż = message.toLowerCase().indexOf("już") !== -1;
    //     const usedJuz = message.toLowerCase().indexOf("juz") !== -1;
    //     const usedLive = message.toLowerCase().indexOf("live") !== -1;
    //     const usedPBE = message.toLowerCase().indexOf("pbe") !== -1;
    //     const usedPath = message.toLowerCase().indexOf("path") !== -1;
    //     const usedPatch = message.toLowerCase().indexOf("patch") !== -1;
    //     const usedSet = message.toLowerCase().indexOf("set") !== -1;
    //     const usedDalej = message.toLowerCase().indexOf("dalej") !== -1;
    //     const usedtoJużLive = message.toLowerCase().indexOf("to już live") !== -1;
    //     const usedtoJuzLive = message.toLowerCase().indexOf("to juz live") !== -1;

    //     if (
    //       ((usedJuż || usedDalej|| usedJuz) &&
    //         (usedLive || usedPBE) &&
    //         (usedPath || usedPath || usedSet)) ||
    //       usedtoJużLive ||
    //       usedtoJuzLive
    //     ) {
    //       ComfyJS.Say(`@${user} tak już na live`, extra.channel);
    //     }

    // volume [value] command
    const isVolumeCommand = message.lastIndexOf("volume");
    const volumeValue = message.substr(7);

    if (isVolumeCommand == 0 && (flags.mod || flags.broadcaster)) {
      console.log(extra.channel, volumeValue);
      setVolume(extra.channel, volumeValue);
    }

    // piramidka [emote] command

    const isPriamidka = message.lastIndexOf("piramidka");
    let emote = message.substr(9);
    !emote && (emote = "catJAM ");
    if (isPriamidka == 0 && message.length < 30 && (flags.mod || flags.broadcaster)) {
      ComfyJS.Say(emote + " ", extra.channel);
      ComfyJS.Say(emote + " " + emote + " ", extra.channel);
      ComfyJS.Say(emote + " " + emote + " " + emote + " ", extra.channel);
      ComfyJS.Say(emote + " " + emote + " " + emote + " " + emote + " ", extra.channel);
      ComfyJS.Say(emote + " " + emote + " " + emote + " ", extra.channel);
      ComfyJS.Say(emote + " " + emote + " ", extra.channel);
      ComfyJS.Say(emote + " ", extra.channel);
    }

    extra.customRewardId && console.log(extra.customRewardId, extra.channel);

    //WOJTI SPAM NA IMIE

    //     if (user == "traviscwat" && extra.channel == "simplywojtek") {
    //       let now = Date.now();

    //       if (timeCooldownTravis < now) {
    //         timeCooldownTravis = 5 * 60 * 1000 + now;
    //         ComfyJS.Say("Travis UPOUPO", extra.channel);
    //       }
    //     }

    //     if (user == "traviscwat" && extra.channel == "l2plelouch") {
    //       let now = Date.now();

    //       if (timeCooldownTravis < now) {
    //         timeCooldownTravis = 5 * 60 * 1000 + now;
    //         ComfyJS.Say("^ Denciak", extra.channel);
    //       }
    //     }

    //     if (user == "og1ii" && extra.channel == "l2plelouch") {
    //       let now = Date.now();

    //       if (timeCooldownOgiii < now) {
    //         timeCooldownOgiii = 5 * 60 * 1000 + now;
    //         ComfyJS.Say("^ Dyktator", extra.channel);
    //       }
    //     }
  };
};

function randomInt(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = {
  messages,
  setTimeoutVolume,
};
