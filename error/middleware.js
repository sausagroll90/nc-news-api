exports.handleCustomError = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.handlePostgreSQLError = (err, req, res, next) => {
  switch (err.code) {
    case "22P02":
    case "23502":
      res.status(400).send({ msg: "bad request" });
      break;
    default:
      next(err);
  }
};

exports.handleOtherError = (err, req, res, next) => {
  console.log("Internal server error -->", err);
  res.status(500).send({ msg: "internal server error" });
};
