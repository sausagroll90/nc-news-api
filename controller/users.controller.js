const { selectUsers } = require("../model/users.model.js");

exports.getUsers = async (req, res, next) => {
  const users = await selectUsers();
  res.status(200).send({ users });
};
