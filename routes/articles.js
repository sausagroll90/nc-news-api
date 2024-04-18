const router = require("express").Router();
const {
  getArticles,
  getArticleById,
  patchArticle,
} = require("../controller/articles.controller");
const {
  getCommentsByArticleId,
  postComment,
} = require("../controller/comments.controller");

router.route("/").get(getArticles);

router.route("/:article_id").get(getArticleById).patch(patchArticle);

router
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postComment);

module.exports = router;
