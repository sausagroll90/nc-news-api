const {
  selectArticles,
  insertArticle,
  selectArticleById,
  updateArticleVotes,
  removeArticle,
} = require("../model/articles.model.js");

exports.getArticles = async (req, res, next) => {
  try {
    const { articles, total_count } = await selectArticles(req.query);
    res.status(200).send({ articles, total_count });
  } catch (err) {
    next(err);
  }
};

exports.postArticle = async (req, res, next) => {
  try {
    const article = await insertArticle(req.body);
    article.comment_count = 0;
    res.status(201).send({ article });
  } catch (err) {
    next(err);
  }
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
  try {
    const article = await updateArticleVotes(article_id, req.body);
    res.status(200).send({ article });
  } catch (err) {
    next(err);
  }
};

exports.deleteArticle = async (req, res, next) => {
  const { article_id } = req.params;
  try {
    await removeArticle(article_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
