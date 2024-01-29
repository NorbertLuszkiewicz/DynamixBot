const mongoose = require("mongoose");
require("../models/User");

const User = mongoose.model("user");

const addUser = newUserData => {
  const newUser = new User(newUserData);
  newUser.save();
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

const updateUser = async user => {
  try {
    return await User.findOneAndUpdate({ streamer: user.streamer }, user);
  } catch (err) {
    console.log(`Error while updating user ${err}`);
  }
};

const deleteUser = data => {
  User.findByIdAndDelete({ streamer: data.streamer });
};

module.exports = { addUser, getUser, getAllUser, updateUser };
