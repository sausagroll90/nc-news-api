const {
  selectUsers,
  selectUserByUsername,
} = require("../model/users.model.js");

exports.getUsers = async (req, res, next) => {
  const users = await selectUsers();
  res.status(200).send({ users });
};

exports.getUserByUsername = async (req, res, next) => {
  const { username } = req.params;
  try {
    const user = await selectUserByUsername(username);
    res.status(200).send({ user });
  } catch (err) {
    next(err);
  }
};
