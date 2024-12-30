require('dotenv').config();

const connection = require("./database/connection");
const express = require("express");
const cors = require("cors");

console.log("Bienvenido a LinkMusic")

connection();

const app = express();
const port = process.env.PORT_EXPRESS;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Rutas
app.get("/test", (req, res) =>{

    return res.status(200).send("test")
})

app.listen(port, () => {
    console.log("El servidor de node esta escuchando en el puerto:", port)
}) 