const { selectTopics } = require("../model/topics.model.js")

exports.getTopics = async (req, res, next) => {
  const topics = await selectTopics()
  res.status(200).send({ topics })
};
