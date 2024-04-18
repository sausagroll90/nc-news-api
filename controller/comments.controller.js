const {
  selectCommentsByArticleId,
  insertComment,
  updateCommentVotes,
  removeComment,
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

exports.patchComment = async (req, res, next) => {
  const { comment_id } = req.params;
  try {
    const comment = await updateCommentVotes(comment_id, req.body);
    res.status(200).send({ comment });
  } catch (err) {
    next(err)
  }
};

exports.deleteComment = async (req, res, next) => {
  const { comment_id } = req.params;
  try {
    await removeComment(comment_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
