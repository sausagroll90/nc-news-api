const express = require("express");
const { handleCustomError, handlePostgreSQLError, handleOtherError } = require("./middleware");
const { getTopics } = require("./controller/topics.controller");
const { getArticleById } = require("./controller/articles.controller");

const app = express();

app.get("/api", (req, res, next) => {
  const endpoints = require("./endpoints.json");
  res.status(200).send(endpoints);
});

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.all("/*", (req, res, next) => {
  next({ status: 404, msg: "not found" });
});

app.use(handleCustomError);

app.use(handlePostgreSQLError)

app.use(handleOtherError);

module.exports = app;
