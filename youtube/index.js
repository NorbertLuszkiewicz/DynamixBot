
const isBlockedVideo = async (url, streamer) => {
  
  let id = url.slice(url.lastIndexOf("v=") + 1)
  id = url.slice(url.lastIndexOf("v=") + 1)
  
  const existThisAccount = data.riotAccountList.find(
    (riotAccount) => riotAccount.name == name && riotAccount.server == server
  ); 

  if (!existThisAccount) {
    const { response } = await api.Summoner.getByName(name, server);

    const newRiotAccountList = data.riotAccountList
      ? [
          ...data.riotAccountList,
          { name, server, puuid: response.puuid, id: response.id },
        ]
      : [{ name, server, puuid: response.puuid, id: response.id }];

    await updateUser({
      streamer,
      riotAccountList: newRiotAccountList,
    });
  }
};



module.exports = {
  addTftUser,
  tftMatchList,
  checkActiveRiotAccount,
  getMatch,
  getStats,
  getRank,
};