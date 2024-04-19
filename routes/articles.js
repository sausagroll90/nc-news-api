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
const { send405Response } = require("./middleware");

router
  .route("/")
  .get(getArticles)
  .post(postArticle)
  .all((req, res, next) => {
    send405Response(res, ["GET", "POST"]);
  });

router
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticle)
  .delete(deleteArticle)
  .all((req, res, next) => {
    send405response(res, ["GET", "PATCH", "DELETE"]);
  });

router
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postComment)
  .all((req, res, next) => {
    send405response(res, ["GET", "POST"]);
  });

module.exports = router;
