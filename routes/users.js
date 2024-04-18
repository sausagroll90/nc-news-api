const router = require("express").Router();
const { getUsers, getUserByUsername } = require("../controller/users.controller");

router.route("/").get(getUsers);

router.route("/:username").get(getUserByUsername)

module.exports = router;
