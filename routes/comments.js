const router = require("express").Router();
const {
  patchComment,
  deleteComment,
} = require("../controller/comments.controller");
const { send405Response } = require("./middleware");

router
  .route("/:comment_id")
  .patch(patchComment)
  .delete(deleteComment)
  .all((req, res, next) => {
    send405Response(res, ["PATCH", "DELETE"]);
  });

module.exports = router;
