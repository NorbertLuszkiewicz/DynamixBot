const mongoose = require("mongoose");
require("../models/User");

const User = mongoose.model("user");

export const addUser = newUserData => {
  const newUser = new User(newUserData);
  newUser.save();
};

export const getAllUser = async () => {
  try {
    const data = await User.find({});
    return data;
  } catch (err) {
    console.log(`Error while getting all users ${err}`);
  }
};

export const getUser = async user => {
  try {
    const data = await User.find({ streamer: user });
    return data;
  } catch (err) {
    console.log(`Error while getting user ${err}`);
  }
};

export const updateUser = async user => {
  try {
    return await User.findOneAndUpdate({ streamer: user.streamer }, user);
  } catch (err) {
    console.log(`Error while updating user ${err}`);
  }
};

export const deleteUser = data => {
  User.findByIdAndDelete({ streamer: data.streamer });
};
