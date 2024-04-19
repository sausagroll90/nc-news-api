const router = require("express").Router();
const { getTopics, postTopic } = require("../controller/topics.controller");
const { send405Response } = require("./middleware");

router
  .route("/")
  .get(getTopics)
  .post(postTopic)
  .all((req, res, next) => {
    send405Response(res, ["GET", "POST"]);
  });

module.exports = router;
