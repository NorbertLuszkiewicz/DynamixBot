const { TftApi, Constants } = require("twisted");
const {
  updateUser,
} = require("./controllers/UserController.js");

const api = new TftApi();

const getUserTFT = async () => {
  console.log("asd")
  
  const { response } = await api.Summoner.getByName(
    "DynaM1X1",
    Constants.Regions.LAT_NORTH
  );
  
          await updateUser({
          streamer: streamer,
          puuid:response.puuid,
        });

  console.log(response);
};

module.exports = {getUserTFT}