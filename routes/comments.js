const router = require("express").Router();
const { deleteComment } = require("../controller/comments.controller");

router.route("/:comment_id").delete(deleteComment);

module.exports = router;
