const express = require("express");
const check = require("../middlewares/auth");

const router = express.Router();

const UserController = require("../controllers/user");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:id", check.auth, UserController.profile);

module.exports = router;
