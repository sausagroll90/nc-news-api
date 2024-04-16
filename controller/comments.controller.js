const {
  selectCommentsByArticleId,
  insertComment,
} = require("../model/comments.model");

exports.getCommentsByArticleId = async (req, res, next) => {
  const { article_id } = req.params;
  try {
    const comments = await selectCommentsByArticleId(article_id);
    res.status(200).send({ comments });
  } catch (err) {
    next(err);
  }
};

exports.postComment = async (req, res, next) => {
  const { article_id } = req.params;
  try {
    const comment = await insertComment(req.body, article_id);
    res.status(201).send({ comment });
  } catch (err) {
    next(err);
  }
};
