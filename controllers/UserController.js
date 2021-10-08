const mongoose = require("mongoose");
require("../models/User");

const User = mongoose.model("user");

const addUser = ({
    streamer,
    twitchAccessToken,
    twitchRefreshToken,
    spotifyRefreshToken,
    spotifyAccessToken,
    device,
    code,
    clientSongRequestID,
    clientSongRequestSecret,
    addSongID,
    skipSongID,
    volumeSongID,
    maxVolumeTime,
    timeoutVolume,
    timeCooldownTravis,
    timeCooldownOg1ii,
    endTime
  }) => {
  const newUserData = {
    streamer,
    twitchAccessToken,
    twitchRefreshToken,
    spotifyRefreshToken,
    spotifyAccessToken,
    device,
    code,
    clientSongRequestID,
    clientSongRequestSecret,
    addSongID,
    skipSongID,
    volumeSongID,
    maxVolumeTime,
    timeoutVolume,
    timeCooldownTravis,
    timeCooldownOg1ii,
    endTime
  };

  const newUser = new User(newUserData);
  newUser.save()
};

const getAllUser = async () => {
  try {
    const data = await User.find({});
    return data;
  } catch (err) {
    console.log(`Error while getting all users ${err}`);
  }
};

const getUser = async user => {
  try {
    const data = await User.find({ streamer: user });
    return data;
  } catch (err) {
    console.log(`Error while getting user ${err}`);
  }
};


const updateUser = async (
  {
    streamer,
    twitchAccessToken,
    twitchRefreshToken,
    spotifyRefreshToken,
    spotifyAccessToken,
    device,
    code,
    clientSongRequestID,
    clientSongRequestSecret,
    addSongID,
    skipSongID,
    volumeSongID,
    maxVolumeTime,
    timeoutVolume,
    timeCooldownTravis,
    timeCooldownOg1ii,
    endTime
  },
  res
) => {
  try {
    const updatedUserData = {
    streamer,
    twitchAccessToken,
    twitchRefreshToken,
    spotifyRefreshToken,
    spotifyAccessToken,
    device,
    code,
    clientSongRequestID,
    clientSongRequestSecret,
    addSongID,
    skipSongID,
    volumeSongID,
    maxVolumeTime,
    timeoutVolume,
    timeCooldownTravis,
    timeCooldownOg1ii,
    endTime
  };

    return await User.findOneAndUpdate({ streamer }, updatedUserData);
  } catch (err) {
    console.log(`Error while updating user ${err}`);
  }
};
const deleteUser = data => {
  User.findByIdAndDelete(data.streamer);
};

module.exports = { addUser, getUser, getAllUser, updateUser };
