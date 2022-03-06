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
    
    const gry = await chessAPI.getPlayerCurrentDailyChess(name)
    const gryZMiesiąca = await chessAPI.getPlayerMonthlyArchives(name)
    
    
    const userInfoToReturn = `staty: ${userInfo.username} ${rapidData} ${blitzData} ${bulletData} ${tacticsData} ${bestRapidGame}` 
    
    console.log(gry.body,"aaaaaaaaa", gryZMiesiąca.body)

    return userInfoToReturn;
  }catch(err) {
    console.log(`Error while getting chess player (${err})`);
  }
};


module.exports = {
  getChessUser,
};
