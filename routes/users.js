const router = require("express").Router();
const {
  getUsers,
  getUserByUsername,
} = require("../controller/users.controller");
const { send405Response } = require("./middleware");

router
  .route("/")
  .get(getUsers)
  .all((req, res, next) => {
    send405Response(res, ["GET"]);
  });

router
  .route("/:username")
  .get(getUserByUsername)
  .all((req, res, next) => {
    send405response(res, ["GET"]);
  });

module.exports = router;
