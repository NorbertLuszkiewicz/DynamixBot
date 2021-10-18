const { TftApi, Constants } = require("twisted");

const api = new TftApi();

const matchListTft = async () => {
  console.log("asd")
  
  const { response } = await api.Summoner.getByName(
    "DynaM1X1",
    Constants.Regions.LAT_NORTH
  );

  console.log(response);

  return api.Match.list(response.puuid, Constants.RegionGroups.AMERICAS);
};

module.exports = {matchListTft}