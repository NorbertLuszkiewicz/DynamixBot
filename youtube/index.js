
const axios = require("axios");

const isBlockedVideo = async (url, streamer) => {
    try {
  
  let id = url.slice(url.lastIndexOf("v=") + 2)
  id = id.slice(0, id.indexOf("&"))


    const  data  = await axios.get(
      `${url}songrequest/${clientSongRequestID}/${area}`,
      {
        headers: {
          Authorization: `Bearer ${clientSongRequestSecret}`
        }
      }
    );
      console.log(data)

    return data;
  } catch (err) {
    console.log(
      `Error while getting youtube video (${err} )`
    );
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
isBlockedVideo
};