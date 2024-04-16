const db = require("../db/connection");

exports.selectArticles = async () => {
  const { rows } = await db.query(
    `SELECT articles.article_id, title, topic, articles.author, articles.created_at, articles.votes, article_img_url, COUNT(comment_id) AS comment_count
    FROM articles
    LEFT OUTER JOIN comments
    ON articles.article_id=comments.article_id
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC`
  );
  rows.forEach((row) => {
    row.comment_count = Number(row.comment_count);
  });
  return rows;
};

exports.selectArticleById = async (id) => {
  const { rows } = await db.query(
    `SELECT article_id, title, topic, author, body, created_at, votes, article_img_url
    FROM articles
    WHERE article_id=$1`,
    [id]
  );
  if (rows.length === 0) {
    return Promise.reject({ status: 404, msg: "article not found" });
  }
  return rows[0];
};

exports.updateArticleVotes = async (id, { inc_votes }) => {
  const { rows } = await db.query(
    `UPDATE articles
    SET votes=votes+$1
    WHERE article_id=$2
    RETURNING article_id, title, topic, author, body, created_at, votes, article_img_url`,
    [inc_votes, id]
  );
  return rows[0];
};
