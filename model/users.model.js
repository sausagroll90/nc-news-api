const db = require("../db/connection");

exports.selectUsers = async () => {
  const { rows } = await db.query(
    "SELECT username, name, avatar_url FROM users"
  );
  return rows;
};

exports.selectUserByUsername = async (username) => {
  const { rows } = await db.query(
    `SELECT username, name, avatar_url FROM users
    WHERE username=$1`,
    [username]
  );
  if (rows.length === 0) {
    return Promise.reject({ status: 404, msg: "username not found" });
  }
  return rows[0];
};
