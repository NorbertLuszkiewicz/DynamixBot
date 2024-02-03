"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUser = exports.getAllUser = exports.addUser = void 0;
const mongoose = require("mongoose");
require("../models/User");
const User = mongoose.model("user");
const addUser = (newUserData) => {
    const newUser = new User(newUserData);
    newUser.save();
};
exports.addUser = addUser;
const getAllUser = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield User.find({});
        return data;
    }
    catch (err) {
        console.log(`Error while getting all users ${err}`);
    }
});
exports.getAllUser = getAllUser;
const getUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield User.find({ streamer: user });
        return data;
    }
    catch (err) {
        console.log(`Error while getting user ${err}`);
    }
});
exports.getUser = getUser;
const updateUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield User.findOneAndUpdate({ streamer: user.streamer }, user);
    }
    catch (err) {
        console.log(`Error while updating user ${err}`);
    }
});
exports.updateUser = updateUser;
const deleteUser = (data) => {
    User.findByIdAndDelete({ streamer: data.streamer });
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=UserController.js.map