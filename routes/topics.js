const router = require("express").Router();
const { getTopics, postTopic } = require("../controller/topics.controller");

router.route("/").get(getTopics).post(postTopic);

module.exports = router;
