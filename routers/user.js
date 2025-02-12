const express = require("express");
const check = require("../middlewares/auth");

const router = express.Router();

const UserController = require("../controllers/user");

const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/avatars/")
    },
    filename: (req, file, cb)=> {
        cb(null, "avatar-"+Date.now()+"-"+file.originalname);
    }   
});

const uploads = multer({storage});

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:id", check.auth, UserController.profile);
router.put("/update", check.auth, UserController.update);
router.post("/upload", [check.auth, uploads.single("file0")], UserController.upload);
router.get("/avatar/:file", UserController.avatar);
router.post("/favorite/", check.auth, UserController.song_favorite)

module.exports = router;
