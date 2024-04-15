const express = require("express");
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

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err)
  }
});

app.use((err, req, res, next) => {
  switch (err.code) {
    case "22P02":
      res.status(400).send({ msg: "bad request" })
      break;
    default:
      next(err)
  }
})

app.use((err, req, res, next) => {
  console.log("Internal server error -->", err);
  res.status(500).send({ msg: "internal server error" });
});

module.exports = app;
