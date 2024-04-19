const { selectTopics, insertTopic } = require("../model/topics.model.js");

exports.getTopics = async (req, res, next) => {
  const topics = await selectTopics();
  res.status(200).send({ topics });
};

exports.postTopic = async (req, res, next) => {
  try {
    const topic = await insertTopic(req.body);
    res.status(201).send({ topic });
  } catch (err) {
    next(err);
  }
};
