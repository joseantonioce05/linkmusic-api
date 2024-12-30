const express = require("express");

const router = express.Router();

const AlbumController = require("../controllers/album");

router.get("/prueba", AlbumController.prueba);

module.exports = router;
