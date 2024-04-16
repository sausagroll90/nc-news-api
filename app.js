const express = require("express");
const {
  handleCustomError,
  handlePostgreSQLError,
  handleOtherError,
} = require("./middleware");
const { getTopics } = require("./controller/topics.controller");
const {
  getArticles,
  getArticleById,
  patchArticle,
} = require("./controller/articles.controller");
const {
  getCommentsByArticleId,
  postComment,
  deleteComment,
} = require("./controller/comments.controller");
const { getUsers } = require("./controller/users.controller");

const app = express();

app.use(express.json());

app.get("/api", (req, res, next) => {
  const endpoints = require("./endpoints.json");
  res.status(200).send(endpoints);
});

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);
app.patch("/api/articles/:article_id", patchArticle);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postComment);

app.delete("/api/comments/:comment_id", deleteComment);

app.get("/api/users", getUsers);

app.all("/*", (req, res, next) => {
  next({ status: 404, msg: "resource not found" });
});

app.use(handleCustomError);

app.use(handlePostgreSQLError);

app.use(handleOtherError);

module.exports = app;
