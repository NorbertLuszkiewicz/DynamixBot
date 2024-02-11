import ComfyJS from "comfy.js";

import { nextSong, pauseSong, refreshDevices, changeVolumeOnTime, setVolume, currentlyPlaying } from "../../spotify";
import { getSong, updateSong } from "../../../controllers/SongController";
import { getCommand, updateCommand } from "../../../controllers/CommandController";
import { timeRequest, removeBlockedSong } from "../../streamElements";
import { changeBadWords } from "../../../helpers";
import { timeout } from "./helix";
import { getAllCredentials } from "../../../controllers/CredentialsController";

let timeoutVolume = {};

export const setTimeoutVolume = async (): Promise<void> => {
  try {
    const allUsers = await getAllCredentials();
    timeoutVolume = allUsers.reduce((acc, key) => ({ ...acc, [key.streamer]: null }), {});
  } catch {
    console.log("Error when call setTimeoutVolume");
  }
};

export const messages = () => {
  ComfyJS.onChat = async (user, message, flags, self, extra) => {
    try {
      const [{ addSongID, skipSongID, skipSongs, volumeChanger }] = await getSong(extra.channel);
      const [{ rollID, banID, slotsID }] = await getCommand(extra.channel);

      if (flags.customReward && message === "add-song-award" && (flags.mod || flags.broadcaster)) {
        updateSong({
          streamer: extra.channel,
          addSongID: extra.customRewardId,
        });

        ComfyJS.Say("Włączono automatyczne dodawanie piosenki przy zakupie tej nagrody", extra.channel);
      }

      if (flags.customReward && message === "skip-song-award" && (flags.mod || flags.broadcaster)) {
        updateSong({
          streamer: extra.channel,
          skipSongID: extra.customRewardId,
        });

        ComfyJS.Say("Włączono automatyczne pomijanie piosenki przy zakupie tej nagrody", extra.channel);
      }

      if (flags.customReward && message === "change-volume-song-award" && (flags.mod || flags.broadcaster)) {
        const newVolumeChanger = volumeChanger;
        newVolumeChanger.id = extra.customRewardId;

        updateSong({
          streamer: extra.channel,
          volumeChanger: newVolumeChanger,
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

        updateCommand({
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

        updateCommand({
          streamer: extra.channel,
          slotsID: slitsIDChanged,
        });
      }

      if (
        user === "StreamElements" &&
        (message.lastIndexOf("to the queue") != -1 || message.lastIndexOf("do kolejki") != -1)
      ) {
        if (skipSongs.pauseAfterRequest) {
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
        const spotifyData = await currentlyPlaying(extra.channel);

        if (spotifyData?.is_playing) {
          nextSong(extra.channel);
        } else {
          ComfyJS.Say("!skip", extra.channel);
          await timeRequest(extra.channel, "skip");
        }
      }

      const { id, min, max, minSR, maxSR, time } = volumeChanger
        ? volumeChanger
        : {
            id: null,
            min: null,
            max: null,
            minSR: null,
            maxSR: null,
            time: null,
          };

      if (volumeChanger && flags.customReward && extra.customRewardId === id) {
        ComfyJS.Say("!volume " + maxSR, extra.channel);
        changeVolumeOnTime(extra.channel, min, max, time);
        let [{ maxVolumeTime }] = await getSong(extra.channel);

        let newMaxVolumeTime = 0;
        let now = Date.now();

        if (maxVolumeTime > now) {
          newMaxVolumeTime = maxVolumeTime + time;
        }

        if (!maxVolumeTime || maxVolumeTime < now) {
          newMaxVolumeTime = now + time;
        }

        await updateSong({
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
          const spotifyData = await currentlyPlaying(extra.channel);

          if (spotifyData?.is_playing) {
            nextSong(extra.channel);
          } else {
            ComfyJS.Say("!skip", extra.channel);
            await timeRequest(extra.channel, "skip");
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

    if (
      (message.indexOf("gun l2plelTosia") !== -1 || message.indexOf("Gun l2plelTosia") !== -1) &&
      user != "DynaM1X1" &&
      user != "StreamElements"
    ) {
      ComfyJS.Say(`l2plelTosia overGun ${user}`, extra.channel);
      timeout(user, 60, "strzelał do tosi", extra.channel);
    }

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
