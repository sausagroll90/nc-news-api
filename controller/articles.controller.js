const {
  selectArticles,
  selectArticleById,
  updateArticleVotes,
} = require("../model/articles.model.js");

exports.getArticles = async (req, res, next) => {
  const articles = await selectArticles();
  res.status(200).send({ articles });
};

exports.getArticleById = async (req, res, next) => {
  const { article_id } = req.params;
  try {
    const article = await selectArticleById(article_id);
    res.status(200).send({ article });
  } catch (err) {
    next(err);
  }
};

exports.patchArticle = async (req, res, next) => {
  const { article_id } = req.params;
  const article = await updateArticleVotes(article_id, req.body);
  res.status(200).send({ article });
};
