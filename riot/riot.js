const { TftApi, Constants } = require("twisted");

const api = new TftApi();

const matchListTft = async () => {
  const { response } = await api.Summoner.getByName(
    "Maxii",
    Constants.Regions.LAT_NORTH
  );

  console.log(response);

  return api.Match.list(response.puuid, Constants.RegionGroups.AMERICAS);
};
