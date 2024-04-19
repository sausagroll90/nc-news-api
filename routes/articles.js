const router = require("express").Router();
const {
  getArticles,
  postArticle,
  getArticleById,
  patchArticle,
  deleteArticle,
} = require("../controller/articles.controller");
const {
  getCommentsByArticleId,
  postComment,
} = require("../controller/comments.controller");

router.route("/").get(getArticles).post(postArticle);

router
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticle)
  .delete(deleteArticle);

router
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postComment);

module.exports = router;
