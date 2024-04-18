const router = require("express").Router();
const {
  patchComment,
  deleteComment,
} = require("../controller/comments.controller");

router.route("/:comment_id").patch(patchComment).delete(deleteComment);

module.exports = router;
