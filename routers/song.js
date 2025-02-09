const express = require("express");

const router = express.Router();

const check = require("../middlewares/auth");

const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/songs/")
    },
    filename: (req, file, cb)=> {
        cb(null, "song-"+Date.now()+"-"+file.originalname);
    }   
});

const uploads = multer({storage});

const SongController = require("../controllers/song");

router.post("/save", check.auth, SongController.save);
router.get("/one/:id", check.auth, SongController.one);
router.get("/list/:albumId", check.auth, SongController.list);
router.put("/update/:songId", check.auth, SongController.update);
router.delete("/remove/:id", check.auth, SongController.remove);
router.post("/upload/:id", [check.auth, uploads.single("file0")], SongController.upload);
router.get("/audio/:file", SongController.audio);
router.get("/all/:page?", check.auth ,SongController.all)

module.exports = router;
