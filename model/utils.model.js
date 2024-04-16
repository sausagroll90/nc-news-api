const db = require("../db/connection");

exports.checkArticleExists = async (id) => {
  const { rows } = await db.query(
    "SELECT * FROM articles WHERE article_id=$1",
    [id]
  );
  return rows.length !== 0;
};
