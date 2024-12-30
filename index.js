require('dotenv').config();

const connection = require("./database/connection");
const express = require("express");
const cors = require("cors");

console.log("Bienvenido a LinkMusic");

connection();

const app = express();
const port = process.env.PORT_EXPRESS;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const AlbumRoutes = require("./routers/album");
const ArtistRoutes = require("./routers/artist");
const SongRoutes = require("./routers/song");
const UserRoutes = require("./routers/user");

app.use("/api/album", AlbumRoutes);
app.use("/api/artist", ArtistRoutes);
app.use("/api/song", SongRoutes);
app.use("/api/user", UserRoutes);

//Rutas
app.get("/test", (req, res) =>{

    return res.status(200).send("test")
})

app.listen(port, () => {
    console.log("El servidor de node esta escuchando en el puerto:", port)
}) 