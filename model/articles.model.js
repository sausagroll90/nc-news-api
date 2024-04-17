const db = require("../db/connection");
const { checkExists } = require("./utils.model");

exports.selectArticles = async (queryParams) => {
  const { topic } = queryParams;
  const values = [];

  let queryStr = `SELECT articles.article_id, title, topic, articles.author, articles.created_at, articles.votes, article_img_url, COUNT(comment_id)::INT AS comment_count
  FROM articles
  LEFT OUTER JOIN comments
  ON articles.article_id=comments.article_id`;

  if (topic) {
    queryStr += " WHERE topic=$1";
    values.push(topic);
  }

  queryStr += ` GROUP BY articles.article_id
  ORDER BY articles.created_at DESC`;

  const { rows } = await db.query(queryStr, values);

  if (rows.length === 0) {
    const topicExists = await checkExists("topics", "slug", topic);
    if (!topicExists) {
      return Promise.reject({ status: 404, msg: "topic not found" });
    }
  }

  return rows;
};

exports.selectArticleById = async (id) => {
  const { rows } = await db.query(
    `SELECT articles.article_id, title, topic, articles.author, articles.body, articles.created_at, articles.votes, article_img_url, COUNT(comment_id)::INT AS comment_count
    FROM articles
    LEFT OUTER JOIN comments
    ON articles.article_id=comments.article_id
    WHERE articles.article_id=$1
    GROUP BY articles.article_id`,
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
  if (rows.length === 0) {
    return Promise.reject({ status: 404, msg: "article not found" });
  }
  return rows[0];
};
