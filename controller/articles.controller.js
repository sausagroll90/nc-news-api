const { selectArticleById } = require("../model/articles.model.js");

exports.getArticleById = async (req, res, next) => {
  const { article_id } = req.params
  try {
    const article = await selectArticleById(article_id);
    res.status(200).send({ article });
  } catch (err) {
    next(err)
  }
};
