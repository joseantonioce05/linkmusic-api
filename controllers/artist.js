const Artist = require("../models/artist");
const Album = require("../models/album");
const Song = require("../models/song");
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const fs = require("fs");
const path = require("path");
const album = require("../models/album");

const save = async (req, res) => {

    let params = req.body;

    //Creando un modelo artista
    let artist = new Artist(params);

    //Guardando un artista
    let savedArtist = await artist.save();

    return res.status(200).send({
        status: "success",
        message: "Artista guardado",
        artist
    })
}

const one = async (req, res) => {

    const artistId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(artistId)) {
            return res.status(400).send({
                status: 'error',
                message: 'ID del artista no válido',
            });
        }

    const artist = await Artist.findById(artistId);

    return res.status(200).send({
        status: "success",
        message: "Artista encontrado",
        artist
    })
}

const list = async (req, res) => {
    let page = req.params.page || 1; 
    const itemsPerPage = 5;

    const artists = await Artist.find()
        .sort("name")
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage);
    const total = await Artist.countDocuments();

    if (!artists || artists.length === 0) {
        return res.status(404).send({
            status: "error",
            message: "No hay artistas",
        });
    }

    return res.status(200).send({
        status: "success",
        message: "Lista",
        page,
        itemsPerPage,
        total,
        artists,
    });

}

const update = async (req, res) => {
    try {
        const artistId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(artistId)) {
            return res.status(400).send({
                status: 'error',
                message: 'ID del artista no válido',
            });
        }

        const data = req.body;

        const updateArtist = await Artist.findByIdAndUpdate(artistId, data,{new:true});

        return res.status(200).send({
            status: "success",
            message: "Artista actualizado",
            updateArtist
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Hubo un error al actualizar el artista"
        });
    }
}

const remove = async (req, res) => {

    const artistId = req.params.id;

    try {
        const artistRemove = await Artist.findByIdAndDelete(artistId);
        const albumRemoved = await Album.find({artist: artistId}).remove();

        const songRemoved = await Song.find({album: albumRemoved._id}).remove();

        return res.status(200).send({
            status: "success",
            message: "Artista borrado",
            artistRemove,
            albumRemoved,
            songRemoved
        });

    } catch (error) { 
        return res.status(500).send({
        status: "error",
        message: "Error al eliminar el artista o alguno de sus elementos",
        error
    });
    }
}

const upload = async (req, res) => {

    let artistId = req.params.id;

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

    const uploadArtistImage = await Artist.findOneAndUpdate({_id: artistId}, {image: req.file.filename}, {new:true});
    console.log(uploadArtistImage.image)

    if(!uploadArtistImage.image) {
        return res.status(400).send({
            status: 'error',
            message: 'Hubo un error al subir la imagen',
        });
    }

    return res.status(200).send({
        status: "success",
        message: "Imagen subida",
        artist: uploadArtistImage,
        file: req.file
    });
}

const image = (req, res) => {
    const file = req.params.file;

    const filePath = "./uploads/artists/" + file;
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
    image
}