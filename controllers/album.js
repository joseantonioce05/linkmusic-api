const Album = require("../models/album")
const Song = require("../models/song")
const fs = require("fs");
const path = require("path");

const save = async (req, res) => {

    let params = req.body

    let album = new Album(params);

    try {
        const albumStored = await album.save()

        return res.status(200).send({
            status: "success",
            message: "Album guardado",
            albumStored
        })
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "No se pudo guardar el album",
            error
        })
    }
}

const one = async (req, res) => {
    const albumId = req.params.id;

    try {
        const albumSearched = await Album.findById(albumId).populate("artist");

        return res.status(200).send({
            status: "success",
            message: "Album conseguido",
            albumSearched
        });
    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "Hubo un error al buscar el album",
            error
        });
    }
}

const list = async (req, res) => {
    const artistId = req.params.artistId;

    if(!artistId){
        return res.status(404).send({
            status: "error",
            message: "No se a encontrado el artista",
            error
        });
    }

    try {
        const albumList = await Album.find({artist: artistId}).populate("artist");

        return res.status(200).send({
            status: "success",
            message: "Album conseguido",
            albumList
        });
    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "Hubo un error al buscar album para listar",
            error
        });
    }
}

const listAll = async (req, res) => {
    try {
        const albumList = await Album.find().populate("artist").sort("created_at")

        return res.status(200).send({
            status: "success",
            message: "Albums conseguidos",
            albumList
        })
    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "Hubo un error al buscar album para listar",
            error
        });
    }
}

const update = async (req, res) => {

    const albumId = req.params.albumId;

    const data = req.body;

    try {
        const updateAlbum = await Album.findByIdAndUpdate(albumId, data, {new:true})

        if(updateAlbum == null){
            return res.status(200).send({
                status: "success",
                message: "Album no encontrado"
            });
        }

        return res.status(200).send({
            status: "success",
            updateAlbum
        });
    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "Hubo un error al actualizar el album",
            error
        });
    }
    
}

const upload = async (req, res) => {

    let albumId = req.params.id;

    if(!req.file){
        return res.status(404).send({
            status: 'error',
            message: 'La peticion no incluye la imagen',
        });
    }

    let image = req.file.originalname;

    const imageSplit = image.split("\.");
    const extension = imageSplit[1];

    if(extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif"){

        //Borramos el archivo
        const filePath = req.file.path;
        const fileDeleted = fs.unlinkSync(filePath);

        return res.status(404).send({
            status: 'error',
            message: 'La extension no es valida',
        });
    };

    const uploadAlbumImage = await Album.findOneAndUpdate({_id: albumId}, {image: req.file.filename}, {new:true});
    console.log(uploadAlbumImage.image)

    if(!uploadAlbumImage.image) {
        return res.status(400).send({
            status: 'error',
            message: 'Hubo un error al subir la imagen',
        });
    }

    return res.status(200).send({
        status: "success",
        message: "Imagen subida",
        artist: uploadAlbumImage,
        file: req.file
    });
}

const image = (req, res) => {
    const file = req.params.file;

    const filePath = "./uploads/albums/" + file;
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

const remove = async (req, res) => {

    const albumId = req.params.id;

    try {
        const albumRemoved = await Album.findById(albumId).deleteMany();
        const songsRemoved = await Song.find({album: albumId}).deleteMany();

        return res.status(200).send({
            status: "success",
            message: "Artista borrado",
            albumRemoved,
            songsRemoved
        });

    } catch (error) { 
        console.log(error)
        return res.status(500).send({
        status: "error",
        message: "Error al eliminar el artista o alguno de sus elementos",
        error
    });
    }
}

module.exports = {
    save,
    one,
    list,
    listAll,
    update,
    upload,
    image,
    remove,
}