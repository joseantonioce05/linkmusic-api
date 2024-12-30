const express = require("express");

const router = express.Router();

const SongController = require("../controllers/song");

router.get("/prueba", SongController.prueba);

module.exports = router;
