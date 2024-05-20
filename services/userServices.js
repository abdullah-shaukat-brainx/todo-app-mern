const { User } = require("../models");

const addUser = async (data) => {
  return await User.create(data);
};

const findUser = async (condition) => {
  const user = await User.findOne(condition);
  return user;
};


const updatePassword = async (condition, data) => {
  const user = await User.findOneAndUpdate(condition, data);
  return user;
};

module.exports = {
  findUser,
  addUser,
  updatePassword,
};
