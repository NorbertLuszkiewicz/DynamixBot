const axios = require("axios");
const ChessWebAPI = require("chess-web-api");
let chessAPI = new ChessWebAPI();

const getChessUser = async (name, streamer) => {
  try {
    const {body} = await chessAPI.getPlayer(name);
    const userStatsAllData = await chessAPI.getPlayerStats(name);
    const userInfo = body
    const userStats = userStatsAllData.body

    const bulletData = userStats.chess_bullet ? `| BULLET: ${userStats.chess_bullet.last.rating}`: ""
    const blitzData = userStats.chess_blitz ? `| BLITZ: ${userStats.chess_blitz.last.rating}`: ""
    const rapidData = userStats.chess_rapid ? `| RAPID: ${userStats.chess_rapid.last.rating}`: ""
    const tacticsData = userStats.chess_bullet ? `| ZADANIA: najwyżej ${userStats.tactics.highest.rating}`: ""
    const bestRapidGame = (userStats.chess_rapid && userStats.chess_rapid.best.game) ? `| gra o najwyższy ranking rapid: ${userStats.chess_rapid.best.game}`: ""
    
    
    
    
    const userInfoToReturn = `staty: ${userInfo.username} ${rapidData} ${blitzData} ${bulletData} ${tacticsData} ${bestRapidGame}` 
    
    console.log(userInfo, userStats, userInfoToReturn)

    return userInfoToReturn;
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
