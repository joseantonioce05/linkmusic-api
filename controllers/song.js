const Song = require("../models/song");
const fs = require("fs");
const path = require("path");

const save = async (req, res) => {
    let params = req.body;

    let song = new Song(params);

    try {
        const savedSong = await song.save();

        return res.status(200).send({
            status: "success",
            message: "Se ha guardado la cancion exitosamente",
            song: savedSong,
        })
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "La cancion no se ha guardado",
            error,
        })
    }
}

const one = async (req, res) => {
    let songId = req.params.id;

    try {
        let searchSong = await Song.findById(songId).populate("album");

        return res.status(200).send({
            status: "success",
            message: "Cancion encontrada",
            song: searchSong,
        })

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Hubo un error al buscar la cancion",
            error,
        })
    }
}

const all = async (req, res) => {
    let page = req.params.page || 1; 
    const itemsPerPage = 5;

    try {
        const allSongList = await Song.find()
        .populate({path: "album", populate:{path: "artist", model: "Artist"}})
        .sort("created_at")
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage)
        
        return res.status(200).send ({
            status: "success",
            message: "Lista de canciones",
            songList: allSongList
        })
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Hubo un error al traer la lista de canciones",
            error,
        })
    }
}

const list = async (req, res) => {
    let albumId = req.params.albumId;

    try {
        const songList = await Song.find({album: albumId})
        .populate({path: "album", populate:{path: "artist", model: "Artist"}})
        .sort("track");

        return res.status(200).send({
            status: "success",
            message: "Cancion encontrada",
            song: songList,
        })

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Hubo un error al buscar la cancion",
            error,
        })
    }
}

const update = async (req, res) => {
    let songId = req.params.songId;

    let data = req.body;

    try {
        const updatedSong = await Song.findByIdAndUpdate(songId, data, {new:true})

        return res.status(200).send({
            status: "success",
            message: "Cancion encontrada",
            updatedSong,
        })
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "error al actualizar la cancion",
            error,
        })
    }
}

const remove = async (req, res) => {
    const songId = req.params.id;
    
    try {
        const songRemoved = await Song.findByIdAndDelete(songId)

        return res.status(200).send({
            status: "success",
            song: songRemoved,
        })

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status: "error",
            message: "Error al borrar la cancion",
            error,
        })
    }
}

const upload = async (req, res) => {

    let songId = req.params.id;

    if(!req.file){
        return res.status(404).send({
            status: 'error',
            message: 'La peticion no incluye la imagen',
        });
    }

    let image = req.file.originalname;

    const imageSplit = image.split("\.");
    const numberElements = Object.keys(imageSplit).length;

    if(numberElements == 2){
        const extension = imageSplit[1];

        if(extension != "mp3" && extension != "ogg"){

            //Borramos el archivo
            const filePath = req.file.path;
            const fileDeleted = fs.unlinkSync(filePath);
    
            return res.status(404).send({
                status: 'error',
                message: 'La extension no es valida',
            });
        };
    } else {
        const extension = imageSplit[numberElements-1];

        if(extension != "mp3" && extension != "ogg"){

            //Borramos el archivo
            const filePath = req.file.path;
            const fileDeleted = fs.unlinkSync(filePath);
    
            return res.status(404).send({
                status: 'error',
                message: 'La extension no es valida',
            });
        };
    }
    console.log(req.file.filename)
    const uploadSong = await Song.findOneAndUpdate({_id: songId}, {file: req.file.filename}, {new:true});
    console.log(uploadSong.file)

    if(!uploadSong.file) {
        return res.status(400).send({
            status: 'error',
            message: 'Hubo un error al subir la cancion',
        });
    }

    return res.status(200).send({
        status: "success",
        message: "Cancion subida",
        artist: uploadSong,
        file: req.file
    });
}

const audio = (req, res) => {
    const file = req.params.file;

    const filePath = "./uploads/songs/" + file;
    console.log(filePath)

    fs.stat(filePath, (error, exists) => {

        if(error || !exists){
            return res.status(404).send({
                status: "error",
                message: "No existe la imagen"
            })
        }

        return res.sendFile(path.resolve(filePath));
    });
}

module.exports = {
    save,
    one,
    list,
    update,
    remove,
    upload,
    audio,
    all
}