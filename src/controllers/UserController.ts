import { User } from "../types/types";

const mongoose = require("mongoose");
require("../models/User");

const User = mongoose.model("user");

export const addUser = (newUserData: User): void => {
  const newUser = new User(newUserData);
  newUser.save();
};

export const getAllUser = async (): Promise<User> => {
  try {
    const data: User[] = await User.find({});

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
