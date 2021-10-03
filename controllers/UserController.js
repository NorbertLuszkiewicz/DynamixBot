const mongoose = require("mongoose");
require("../models/User");

const User = mongoose.model("user");

const addUser = ({
  stremer,
  clientID,
  clientSecret,
  device,
  code,
  clientSongRequestID,
  addSongID,
  skipSongID,
  volumeSongID,
}) => {
  const newUserData = {
    stremer,
    clientID,
    clientSecret,
    device,
    code,
    clientSongRequestID,
    addSongID,
    skipSongID,
    volumeSongID,
  };

  const newUser = new User(newUserData);
  newUser.save().then(() => {
    console.log("User added");
  });
};

const getAllUser = async () => {
  try{
    const data = await User.find({})
    return data
  }catch (err){
    console.log(err)
  }
};

const getUser = async (user) => {
  try{
    const data = await User.find({ streamer: user })
    return data
  }catch (err){
    console.log(err)
  }
};

const updateUser = (data, res) => {
  const updatedUserData = {
    clientID: data.clientID,
    clientSecret: data.clientSecret,
    device: data.device,
    code: data.code,
    clientSongRequestID: data.clientSongRequestID,
    addSongID: data.addSongID,
    skipSongID: data.skipSongID,
    volumeSongID: data.volumeSongID,
  };
  User.findByIdAndUpdate(data.stremer, updatedUserData)
    .then((updatedUser) => res.send(updatedUser))
    .catch((err) => console.log(err));
};
const deleteUser = (data) => {
  User.findByIdAndDelete(data.streamer);
};

module.exports = { addUser, getUser };
