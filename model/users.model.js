const db = require("../db/connection");
const { handleSimple404 } = require("./utils.model");

exports.selectUsers = async () => {
  const { rows } = await db.query(
    "SELECT username, name, avatar_url FROM users"
  );
  return rows;
};

const naiveSelectUserByUsername = async (username) => {
  const { rows } = await db.query(
    `SELECT username, name, avatar_url FROM users
    WHERE username=$1`,
    [username]
  );
  return rows[0];
};

exports.selectUserByUsername = handleSimple404(
  naiveSelectUserByUsername,
  "username not found"
);
