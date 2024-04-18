const db = require("../db/connection");
const { checkExists } = require("./utils.model");

exports.selectArticles = async (queryParams) => {
  const { topic, order = "desc", p, limit = 10 } = queryParams;
  let { sort_by = "created_at" } = queryParams;
  const queryValues = [];

  const validCols = [
    "article_id",
    "title",
    "topic",
    "author",
    "created_at",
    "votes",
    "article_img_url",
    "comment_count",
  ];
  const validOrders = ["asc", "desc"];
  if (!validCols.includes(sort_by) || !validOrders.includes(order)) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }

  let queryStr = `SELECT articles.article_id, title, topic, articles.author, articles.created_at, articles.votes, article_img_url, COUNT(comment_id)::INT AS comment_count
  FROM articles
  LEFT OUTER JOIN comments
  ON articles.article_id=comments.article_id`;

  if (topic) {
    queryStr += " WHERE topic=$1";
    queryValues.push(topic);
  }

  queryStr += " GROUP BY articles.article_id";

  queryStr += ` ORDER BY ${sort_by} ${order.toUpperCase()}`;

  if (p) {
    if (topic) {
      queryStr += " LIMIT $2 OFFSET $3";
      queryValues.push(limit);
      queryValues.push((p - 1) * limit);
    } else {
      queryStr += " LIMIT $1 OFFSET $2";
      queryValues.push(limit);
      queryValues.push((p - 1) * limit);
    }
  }

  const { rows } = await db.query(queryStr, queryValues);

  if (rows.length === 0) {
    if (!topic) {
      return Promise.reject({ status: 404, msg: "page not found" });
    }
    const topicExists = await checkExists("topics", "slug", topic);
    if (!topicExists) {
      return Promise.reject({ status: 404, msg: "topic not found" });
    }
  }

  return rows;
};

exports.insertArticle = async ({
  title,
  topic,
  author,
  body,
  article_img_url,
}) => {
  let queryStr = "INSERT INTO articles";
  const queryValues = [title, topic, author, body];

  if (article_img_url) {
    queryStr += "(title, topic, author, body, article_img_url)";
  } else {
    queryStr += " (title, topic, author, body)";
  }

  queryStr += " VALUES";

  if (article_img_url) {
    queryStr += " ($1, $2, $3, $4, $5)";
    queryValues.push(article_img_url);
  } else {
    queryStr += " ($1, $2, $3, $4)";
  }

  queryStr += " RETURNING *";
  try {
    const { rows } = await db.query(queryStr, queryValues);
    return rows[0];
  } catch (err) {
    if (err.code === "23503") {
      const topicExists = await checkExists("topics", "slug", topic);
      if (!topicExists) {
        return Promise.reject({ status: 404, msg: "topic not found" });
      } else {
        return Promise.reject({ status: 404, msg: "author not found" });
      }
    }
    throw err;
  }
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
