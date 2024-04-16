const db = require("../db/connection");

exports.selectCommentsByArticleId = async (id) => {
  const { rows } = await db.query(
    `SELECT comment_id, body, author, article_id, created_at, votes
    FROM comments
    WHERE article_id=$1
    ORDER BY created_at DESC`,
    [id]
  );
  if (rows.length === 0) {
    const { rows: articles } = await db.query(
      `SELECT * FROM articles WHERE article_id=$1`,
      [id]
    );
    if (articles.length === 0) {
      return Promise.reject({ status: 404, msg: "article not found" });
    }
  }
  return rows;
};

exports.insertComment = async (requestBody, article_id) => {
  const { rows } = await db.query(
    `INSERT INTO comments
    (body, author, article_id)
    VALUES
    ($1, $2, $3)
    RETURNING *`,
    [requestBody.body, requestBody.username, article_id]
  );
  return rows[0];
};

