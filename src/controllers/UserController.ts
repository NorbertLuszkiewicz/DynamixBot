import { User } from "../types/types";

const mongoose = require("mongoose");
require("../models/User");

const User = mongoose.model("user");

const dynamixUser = [
  {
    _id: { $oid: "6159a02d84245436a4103ba6" },
    device: "c3e9e9038e921489b7106d098ca11128b330ae36",
    clientSongRequestID: null,
    clientSongRequestSecret: "",
    streamer: "dynam1x1",
    maxVolumeTime: { $numberDouble: "1633344368471.0" },
    timeoutVolume: {},
    endTime: { $numberDouble: "1659724966466.0" },
    twitchToken: "ejata134a9l3s1kacvmg8bzrqqmvee",
    spotifyAccessToken:
      "BQAtmo3tWDAHdkrp6eMaHCmnFO5RkJmnXF3uv_bztv5VpyvsrYJiEQ_lzJGimywCg7Qd4dZabIiobqEBcutz1gATaocLCIEudVBKD5UeJ-jw9Al_29ikVx_ZqYQxR5EKTLKhILQGFmu_TDdEV6fTJ3FAGmf4cR7QWdmoYw1cnzOJ7aWGzR5yV3tNF5A1xiimwWZw7gUOA-Bv7X2_NEBqeWg8Zm_fc_oPygM2mQS_aUKLhmT6YyhfiQhj6lYmiG4FoLNjNGDFG1F6lTgYlmk6-Aakg3CFGhjF0inQXx1fb_dqIAbu-OKYLvEzwhLLzD4Uc-6a-PH3pJkmXNd_",
    spotifyRefreshToken:
      "AQAZPrLi84khOJLBaJjXxckpchprJCRHNrjcL-tkKlcQFnpSIFSkHx91yF3fBZARhfbSOn7jffmz46TaJh2A6lMyjU67QYMlHR9SJWQgIb6ynUnuywCrxAgYYUyAFSiY_G4",
    twitchAccessToken: "d93ikewnk3381a2wt8coroiz3dykv7",
    twitchRefreshToken: "tjwm80xodhvpfjeh4724oyfzyyim391f6b59abnwko2ywyra3g",
    volumeSongID: {
      id: "123456",
      max: { $numberInt: "57" },
      min: { $numberInt: "33" },
      maxSR: { $numberInt: "47" },
      minSR: { $numberInt: "23" },
      time: { $numberInt: "187000" },
      _id: { $oid: "64511960699df433da04a2a4" },
    },
    riotAccountList: [
      {
        name: "DynaM1X",
        server: "EUW1",
        puuid: "IsJ-bK5JXdIzTkCp-dBY5xKabRPavsURnhBzYXwXPuUnp0DO0H04Vv8bidd2CEyEMsLCuKr0lu-veg",
        id: "9pKaRrh9eoreICLglrBWskHqx-uklMUL7okrn8MLm2Uu4h6C",
      },
      {
        name: "DynaM1X1",
        server: "EUN1",
        puuid: "-Pz9yR2Yu5Vg_r-jarmYSSRXKYd-75e7B6-cgClYXxo95YKWii3HAYAQIJS6dI9rC03Ry5Np_fBWPQ",
        id: "O8I2d6scQ0oakRymLc2oy-l7sweK9bQjwbPjmZ50t3O9JlI",
      },
    ],
    activeRiotAccount: {
      name: "DynaM1X",
      server: "EUW1",
      date: { $numberDouble: "1706281005829.0" },
      puuid: "IsJ-bK5JXdIzTkCp-dBY5xKabRPavsURnhBzYXwXPuUnp0DO0H04Vv8bidd2CEyEMsLCuKr0lu-veg",
      id: "9pKaRrh9eoreICLglrBWskHqx-uklMUL7okrn8MLm2Uu4h6C",
      isLol: false,
      _id: { $oid: "65b3c895b29dcf8554c46c60" },
    },
    slotsID: [
      {
        name: "vip",
        id: null,
        withBan: false,
        emotes: { $numberInt: "7" },
        times: { $numberInt: "0" },
        wins: { $numberInt: "0" },
        lastWinners: ["golek22", ""],
      },
      {
        name: "test",
        id: null,
        withBan: false,
        emotes: { $numberInt: "15" },
        times: { $numberInt: "0" },
        wins: { $numberInt: "0" },
      },
      {
        name: "asdasd",
        id: null,
        withBan: false,
        emotes: { $numberInt: "7" },
        times: { $numberInt: "0" },
        wins: { $numberInt: "0" },
      },
    ],
    commandSwitch: {
      weather: true,
      tft: true,
      chess: true,
      wordle: true,
      slots: true,
      song: true,
      _id: { $oid: "63f72ca0e71950e8254b585f" },
    },
    wheelwinners: [
      "MADELLA wygrał: Gift Suba",
      "DULCY wygrał: Gift Suba",
      "ANNY wygrał: Gift Bana",
      "MIGUELITA wygrał: Gift Suba",
      "DATHA wygrał: Gift Suba",
    ],
  },
];

export const addUser = (newUserData: User): void => {
  const newUser = new User(newUserData);
  newUser.save();
};

export const getAllUser = async (): Promise<User> => {
  const data = await dynamixUser;

  return data;
  try {
    const data = await User.find({});

    return data;
  } catch (err) {
    console.log(`Error while getting all users ${err}`);
  }
};

export const getUser = async (user: User): Promise<User> => {
  try {
    const data = await User.find({ streamer: user });
    return data;
  } catch (err) {
    console.log(`Error while getting user ${err}`);
  }
};

export const updateUser = async (user: User): Promise<User> => {
  try {
    return await User.findOneAndUpdate({ streamer: user.streamer }, user);
  } catch (err) {
    console.log(`Error while updating user ${err}`);
  }
};

export const deleteUser = (data: User) => {
  User.findByIdAndDelete({ streamer: data.streamer });
};
