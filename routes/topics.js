const router = require("express").Router();
const { getTopics } = require("../controller/topics.controller");

router.route("/").get(getTopics);

module.exports = router;
