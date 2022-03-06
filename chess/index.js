const axios = require("axios");
const ChessWebAPI = require("chess-web-api");
let chessAPI = new ChessWebAPI();

const getChessUser = async (name, streamer) => {
  try {
    const {body} = await chessAPI.getPlayer("andyruwruw");
    const userStatsAllData = await chessAPI.getPlayerStats("andyruwruw");
    const userInfo = body
    const userStats = userStatsAllData.body

    console.log(userInfo,userStats);

    return userInfo;
  }catch(err) {
    console.log(`Error while getting chess player (${err})`);
  }
};
//const [data] = await getUser(streamer);

//   if (!existThisAccount) {
//     const { response } = await api.Summoner.getByName(name, server);

//     const newRiotAccountList = data.riotAccountList
//       ? [
//           ...data.riotAccountList,
//           { name, server, puuid: response.puuid, id: response.id },
//         ]
//       : [{ name, server, puuid: response.puuid, id: response.id }];

//   }

// const currentlyPlaying = async streamer => {
//   try {
//     const [user] = await getUser(streamer);
//     const { spotifyAccessToken } = user;

//     const { data } = await axios.get(`${PLAYER}?market=US`, {
//       headers: {
//         Authorization: `Bearer ${spotifyAccessToken}`
//       }
//     });

//     return data;
//   } catch ({ response }) {
//     console.log(
//       `Error while getting currently song (${response.status} ${response.statusText})`
//     );
//   }
// };

module.exports = {
  getChessUser,
};
