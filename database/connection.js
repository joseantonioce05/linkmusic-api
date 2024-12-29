const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const connection = async() => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/app_linkmusic");
        console.log("Conectado correctamente a la bd: app_linkmusic");
    } catch (error) {
        console.log(error);
        throw new Error("No se ha establecido la conexion de la bbdd!!");
    }
}

module.exports = connection;