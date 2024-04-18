const router = require("express").Router();

const topicsRouter = require("../routes/topics");
const articlesRouter = require("../routes/articles");
const commentsRouter = require("../routes/comments");
const usersRouter = require("../routes/users");

router.get("/", (req, res, next) => {
  const endpoints = require("../endpoints.json");
  res.status(200).send(endpoints);
});

router.use("/topics", topicsRouter);
router.use("/articles", articlesRouter);
router.use("/comments", commentsRouter);
router.use("/users", usersRouter);

module.exports = router;
