const axios = require("axios");

const isBlockedVideo = async (url, streamer) => {
  try {
    let id = url.slice(url.lastIndexOf("v=") + 2);
    id = id.slice(0, id.indexOf("&"));

    const { data } = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${id}&key=${process.env.YT_ID_TOKEN}`
    );

    const isVideo = data.pageInfo && data.pageInfo.totalResults;
    let isBlocked = false;

    if (
      data.items[0] &&
      data.items[0].contentDetails &&
      data.items[0].contentDetails.regionRestriction &&
      data.items[0].contentDetails.regionRestriction.blocked &&
      data.items[0].contentDetails.regionRestriction.blocked.includes("PL")
    ) {
      isBlocked = true;
    }

    const resultData = { isVideo, isBlocked };

    (!isVideo || isBlocked) && console.log(`This song is blocked (${url}, ${resultData}`);

    return resultData;
  } catch (err) {
    console.log(`Error while getting youtube video (${err} )`);
  }

  //   const existThisAccount = data.riotAccountList.find(
  //     (riotAccount) => riotAccount.name == name && riotAccount.server == server
  //   );

  //   if (!existThisAccount) {
  //     const { response } = await api.Summoner.getByName(name, server);

  //     const newRiotAccountList = data.riotAccountList
  //       ? [
  //           ...data.riotAccountList,
  //           { name, server, puuid: response.puuid, id: response.id },
  //         ]
  //       : [{ name, server, puuid: response.puuid, id: response.id }];

  //     await updateUser({
  //       streamer,
  //       riotAccountList: newRiotAccountList,
  //     });
  //   }
};

module.exports = {
  isBlockedVideo,
};
