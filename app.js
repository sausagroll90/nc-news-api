const express = require("express");
const { getTopics } = require("./controller/topics.controller");

const app = express();

app.get("/api", (req, res, next) => {
  const endpoints = require("./endpoints.json")
  res.status(200).send(endpoints)
})

app.get("/api/topics", getTopics);

app.all("/*", (req, res, next) => {
  next({ status: 404, msg: "not found" });
});

app.use((err, req, res, next) => {
  res.status(err.status).send({ msg: err.msg });
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "internal server error" });
});

module.exports = app;
