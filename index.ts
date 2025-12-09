// import { KickApiWrapper } from "kick.com-api";
// import { createClient } from "@retconned/kick-js";
// import ComfyJS from "comfy.js";
// import axios from "axios";
// import { changeBadWords, plToEnAlphabet } from "../../helpers";
// import { getWeather } from "../twitch/events/twitch";
// import { currentlyPlaying } from "../spotify";
// import { getLolMatchStats, getLolUserStats } from "../riot/lol";
// import { getStats, tftMatchList } from "../riot/tft";
// import { getRiot } from "../../controllers/RiotController";
// import { songPlayingNow } from "../streamElements";

// const client = createClient("dynam1x", { logger: true });

// const kickApi = new KickApiWrapper({
//   userAgent: "DynamixBot",
// });

// const getKickChannelData = async nick => {
//   try {
//     const data = await kickApi.fetchChannelData(nick);
//     return data;
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const initKickChat = async streamer => {
//   const streamerData = await getKickChannelData(streamer);
//   let isLive = streamerData.livestream;

//   setInterval(async () => {
//     const streamerData = await getKickChannelData(streamer);
//     isLive = streamerData.livestream;
//   }, 60 * 1000);

//   try {
//     client.on("ready", () => {
//       console.log(`Bot ready & logged into ${client.user?.tag}!, to stream: ${streamer}`);
//     });
//     const [{ activeRiotAccount }] = await getRiot(streamer);

//     client.login({ token: process.env.KICK_TOKEN, cookies: process.env.KICK_COOKIES });

//     client.on("ChatMessage", async message => {
//       const messageArray: string[] = message.content.split(" ");
//       const commandName = messageArray[0];
//       const restCommand = messageArray.slice(1).join(" ");
//       const user = message.sender.username;

//       if (commandName === "!sr" && isLive) {
//         ComfyJS.Say("!sr " + changeBadWords(restCommand), streamer);
//       }

//       if (commandName === `!songlist`) {
//         sendMessage(
//           `@${user} Kolejkę żądań utworu możesz znaleźć pod adresem: https://streamelements.com/${streamer}/mediarequest`,
//           streamerData.chatroom.id,
//           streamer
//         );
//       }

//       if (commandName === "!dynamix") {
//         // client.sendMessage("dupa");
//         sendMessage("bot work", streamerData.chatroom.id, streamer);
//       }

//       if (commandName === "!weather" || commandName === "!pogoda") {
//         try {
//           const { temp, speed, description } = await getWeather(plToEnAlphabet(restCommand));

//           const weatherIcon = {
//             bezchmurnie: "☀️",
//             pochmurnie: "🌥️",
//             "zachmurzenie małe": "🌤️",
//             "zachmurzenie umiarkowane": "🌥️",
//             "zachmurzenie duże": "☁️",
//             mgła: "🌫️",
//             zamglenia: "🌫️",
//             "umiarkowane opady deszczu": "🌧️",
//             "słabe opady deszczu": "🌧️",
//           };

//           if (temp) {
//             sendMessage(
//               `@${user} Jest ${Math.round(temp - 273)} °C, ${description} ${
//                 weatherIcon[description] || ""
//               } wiatr wieje z prędkością ${speed} km/h (${changeBadWords(restCommand)})`,
//               streamerData.chatroom.id,
//               streamer
//             );
//           } else {
//             sendMessage(`@${user} Nie znaleziono`, streamerData.chatroom.id, streamer);
//           }
//         } catch (err) {
//           console.log(`Error when use !pogoda on twitch (${err})`);
//         }
//       }

//       if (commandName == "!playlist" || commandName == "!playlista") {
//         try {
//           const spotifyData = await currentlyPlaying(streamer);

//           let url = spotifyData.context ? spotifyData.context.external_urls.spotify : "Nieznana Playlista";

//           spotifyData &&
//             sendMessage(`@${user} aktualnie leci ta playlista: ${url} catJAM `, streamerData.chatroom.id, streamer);
//         } catch (err) {
//           console.log(`Error when use !playlist on twitch (${err})`);
//         }
//       }

//       if (
//         commandName === "!stats" ||
//         commandName === "!staty" ||
//         commandName === "!statylol" ||
//         commandName === "!statytft"
//       ) {
//         try {
//           const NickNameAndServer = restCommand ? restCommand.split(", ") : [null, null];
//           let stats;

//           switch (commandName) {
//             case "!statylol": {
//               stats = await getLolUserStats(streamer, NickNameAndServer[0], NickNameAndServer[1]?.toUpperCase());
//               break;
//             }
//             case "!statytft": {
//               stats = await getStats(streamer, NickNameAndServer[0], NickNameAndServer[1]?.toUpperCase());
//               break;
//             }
//             default: {
//               if (activeRiotAccount?.isLol) {
//                 stats = await getLolUserStats(streamer, NickNameAndServer[0], NickNameAndServer[1]?.toUpperCase());
//               } else {
//                 stats = await getStats(streamer, NickNameAndServer[0], NickNameAndServer[1]?.toUpperCase());
//               }
//               break;
//             }
//           }

//           sendMessage(changeBadWords(stats), streamerData.chatroom.id, streamer);
//         } catch (err) {
//           console.log(`Error when use !staty on twitch (${err})`);
//         }
//       }

//       if (
//         commandName === "!matches" ||
//         commandName === "!mecze" ||
//         commandName === "!meczelol" ||
//         commandName === "!meczetft"
//       ) {
//         try {
//           const NickNameAndServer = restCommand ? restCommand.split(", ") : [null, null];
//           const props = [streamer, NickNameAndServer[0], NickNameAndServer[1] && NickNameAndServer[1].toUpperCase()];
//           let matchesList;
//           switch (commandName) {
//             case "!meczelol": {
//               matchesList = await getLolMatchStats(props[0], props[1], props[2]);
//               break;
//             }
//             case "!meczetft": {
//               matchesList = await tftMatchList(props[0], props[1], props[2]);
//               break;
//             }
//             default: {
//               if (activeRiotAccount?.isLol) {
//                 matchesList = await getLolMatchStats(props[0], props[1], props[2]);
//               } else {
//                 matchesList = await tftMatchList(props[0], props[1], props[2]);
//               }
//               break;
//             }
//           }

//           sendMessage(`${matchesList}`, streamerData.chatroom.id, streamer);
//         } catch (err) {
//           console.log(`Error when use !mecze on twitch (${err})`);
//         }
//       }

//       if (commandName === "!song" || commandName === "!coleci") {
//         try {
//           const spotifyData = await currentlyPlaying(streamer);
//           const { title, link, userAdded } = await songPlayingNow(streamer);

//           if (!spotifyData?.is_playing) {
//             sendMessage(
//               `@${user} ${title} ${userAdded && " | dodał/a " + userAdded + " "} ${link} `,
//               streamerData.chatroom.id,
//               streamer
//             );
//           } else {
//             let url = spotifyData?.item?.external_urls?.spotify ? spotifyData?.item?.external_urls?.spotify : "";
//             let title = spotifyData?.item?.name ? spotifyData?.item?.name : "Nieznany tytuł utworu";
//             let autor = "";
//             if (spotifyData.item?.artists?.length > 0) {
//               spotifyData.item?.artists?.forEach(artist => {
//                 autor += artist.name + ", ";
//               });
//             }

//             spotifyData && sendMessage(`@${user} ${title} | ${autor} ${url}`, streamerData.chatroom.id, streamer);
//           }
//         } catch (err) {
//           console.log(`Error when use !song on twitch (${err})`);
//         }
//       }

//       console.log(`${message.sender.username}: ${message.content}`);
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

// const sendMessage = async (message, id, streamer) => {
//   try {
//     const response = await axios.post(
//       `https://kick.com/api/v2/messages/send/${id}`,
//       {
//         content: message,
//         type: "message",
//       },
//       {
//         headers: {
//           accept: "application/json, text/plain, */*",
//           authorization: `Bearer ${process.env.KICK_TOKEN}`,
//           "content-type": "application/json",
//           "x-xsrf-token": process.env.KICK_XSRF_TOKEN,
//           Referer: `https://kick.com/${streamer}`,
//         },
//       }
//     );
//     if (response.status === 200) {
//       console.log(`Message sent successfully: ${message}`);
//     } else {
//       console.error(`Failed to send message. Status: ${response.status}`);
//     }
//   } catch (error) {
//     console.error("Error sending message:", error);
//   }
// };

// import { createClient } from "@retconned/kick-js";
// import ComfyJS from "comfy.js";
// import axios from "axios";
// import { changeBadWords, plToEnAlphabet } from "../../helpers";
// import { getWeather } from "../twitch/events/twitch";
// import { currentlyPlaying } from "../spotify";
// import { getLolMatchStats, getLolUserStats } from "../riot/lol";
// import { getStats, tftMatchList } from "../riot/tft";
// import { getRiot } from "../../controllers/RiotController";
// import { songPlayingNow } from "../streamElements";

// const client = createClient("overpow", { logger: true });

// export const initKickChat = async (streamer) => {
//   client.on("ready", () => {
//     console.log(`Bot ready & logged into ${client.user?.tag}!`);
//   });

//   client.login({ token: "token", cookies: "asd" });

//   client.on("ChatMessage", async (message) => {
//     console.log(`${message.sender.username}: ${message.content}`);
//   });
// };
