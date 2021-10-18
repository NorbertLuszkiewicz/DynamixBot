const { TftApi, Constants } = require("twisted");
const { updateUser, getUser } = require("../controllers/UserController.js");

const api = new TftApi();

const getUserTFT = async streamer => {
  console.log("asd");

  const { response } = await api.Summoner.getByName(
    "DynaM1X1",
    Constants.Regions.EU_EAST
  );

  await updateUser({
    streamer: streamer,
    puuid: response.puuid
  });

};
const tftMatchList = async streamer => {
  console.log("asd");
  const {puuid} = await getUser(streamer)
  
  const data = await api.Match.list(puuid, Constants.Regions.EU_EAST)

};

module.exports = { getUserTFT };
