const db = require("../db/connection");

exports.selectTopics = async () => {
  const { rows } = await db.query("SELECT slug, description FROM topics")
  return rows
};
