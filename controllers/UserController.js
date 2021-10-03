const mongoose = require("mongoose");
require("../models/User");

const User = mongoose.model("user");

const addUser = ({
  stremer,
  refreshToken,
  accessToken,
  device,
  code,
  clientSongRequestID,
  clientSongRequestSecret,
  addSongID,
  skipSongID,
  volumeSongID
}) => {
  const newUserData = {
    stremer,
    refreshToken,
    accessToken,
    device,
    code,
    clientSongRequestID,
    clientSongRequestSecret,
    addSongID,
    skipSongID,
    volumeSongID
  };

  const newUser = new User(newUserData);
  newUser.save().then(() => {
    console.log("User added");
  });
};

const getAllUser = async () => {
  try {
    const data = await User.find({});
    return data;
  } catch (err) {
    console.log(err);
  }
};

const getUser = async user => {
  try {
    const data = await User.find({ streamer: user });
    return data;
  } catch (err) {
    console.log(err);
  }
};

const updateUser = async (
  {
    stremer,
    refreshToken,
    accessToken,
    device,
    code,
    clientSongRequestID,
    clientSongRequestSecret,
    addSongID,
    skipSongID,
    volumeSongID
  },
  res
) => {
  try {
    const updatedUserData = {
      stremer,
      refreshToken,
      accessToken,
      device,
      code,
      clientSongRequestID,
      clientSongRequestSecret,
      addSongID,
      skipSongID,
      volumeSongID
    };

    return await User.findByIdAndUpdate(stremer, updatedUserData);
  } catch (err) {
    console.log(err);
  }
};
const deleteUser = data => {
  User.findByIdAndDelete(data.streamer);
};

module.exports = { addUser, getUser, getAllUser, updateUser };
