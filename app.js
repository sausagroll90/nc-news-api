const express = require("express");
const apiRouter = require("./routes/api");
const {
  handleCustomError,
  handlePostgreSQLError,
  handleOtherError,
} = require("./error/middleware");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.all("/*", (req, res, next) => {
  next({ status: 404, msg: "resource not found" });
});

app.use(handleCustomError);
app.use(handlePostgreSQLError);
app.use(handleOtherError);

module.exports = app;
