const db = require("../db/connection");
const { checkArticleExists } = require("./utils.model");

exports.selectCommentsByArticleId = async (id) => {
  const { rows } = await db.query(
    `SELECT comment_id, body, author, article_id, created_at, votes
    FROM comments
    WHERE article_id=$1
    ORDER BY created_at DESC`,
    [id]
  );
  if (rows.length === 0) {
    const articleExists = await checkArticleExists(id)
    if (!articleExists) {
      return Promise.reject({ status: 404, msg: "article not found" });
    }
  }
  return rows;
};

exports.insertComment = async (requestBody, article_id) => {
  let rows;
  try {
    const queryResult = await db.query(
      `INSERT INTO comments
    (body, author, article_id)
    VALUES
    ($1, $2, $3)
    RETURNING *`,
      [requestBody.body, requestBody.username, article_id]
    );
    rows = queryResult.rows;
  } catch (err) {
    if (err.code === "23503") {
      const articleExists = await checkArticleExists(article_id);
      if (!articleExists) {
        return Promise.reject({ status: 404, msg: "article not found" });
      } else {
        return Promise.reject({ status: 404, msg: "username not found" });
      }
    }
    throw err;
  }
  return rows[0];
};
