const express = require("express");

const router = express.Router();

const check = require("../middlewares/auth")

const AlbumController = require("../controllers/album");

router.post("/save", check.auth ,AlbumController.save);
router.get("/one/:id", check.auth ,AlbumController.one);
router.get("/list/:artistId", check.auth ,AlbumController.list);
router.put("/update/:albumId", check.auth, AlbumController.update);

module.exports = router;
