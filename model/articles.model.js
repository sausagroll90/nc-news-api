const db = require("../db/connection");

exports.selectArticleById = async (id) => {
  const { rows } = await db.query(
    `SELECT article_id, title, topic, author, body, created_at, votes, article_img_url
    FROM articles
    WHERE article_id=$1`,
    [id]
  );
  if (rows.length === 0) {
    return Promise.reject({status:404, msg:"not found"})
  }
  return rows[0];
};
