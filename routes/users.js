const router = require("express").Router();
const { getUsers } = require("../controller/users.controller");

router.route("/").get(getUsers);

module.exports = router;
