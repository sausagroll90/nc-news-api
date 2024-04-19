const db = require("../db/connection");
const { checkExists, handleSimple404 } = require("./utils.model");

exports.selectCommentsByArticleId = async (id, queryParams) => {
  const { p, limit = 10 } = queryParams;

  let queryStr = `SELECT comment_id, body, author, article_id, created_at, votes
  FROM comments
  WHERE article_id=$1
  ORDER BY created_at DESC`;
  const queryValues = [id];

  if (p) {
    queryStr += " LIMIT $2 OFFSET $3";
    queryValues.push(limit);
    queryValues.push((p - 1) * limit);
  }

  const { rows } = await db.query(queryStr, queryValues);

  if (rows.length === 0) {
    const articleExists = await checkExists("articles", "article_id", id);
    if (!articleExists) {
      return Promise.reject({ status: 404, msg: "article not found" });
    }
    if (p > 1) {
      return Promise.reject({ status: 404, msg: "page not found" });
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
      const articleExists = await checkExists(
        "articles",
        "article_id",
        article_id
      );
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

const naiveUpdateCommentVotes = async (id, { inc_votes }) => {
  const { rows } = await db.query(
    `UPDATE comments
    SET votes=votes+$1
    WHERE comment_id=$2
    RETURNING comment_id, body, author, article_id, created_at, votes`,
    [inc_votes, id]
  );
  return rows[0];
};

exports.updateCommentVotes = handleSimple404(
  naiveUpdateCommentVotes,
  "comment not found"
);

const naiveRemoveComment = async (id) => {
  const { rows } = await db.query(
    "DELETE FROM comments WHERE comment_id=$1 RETURNING *",
    [id]
  );
  return rows[0];
};

exports.removeComment = handleSimple404(
  naiveRemoveComment,
  "comment not found"
);
