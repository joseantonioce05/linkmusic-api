const Album = require("../models/album")

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

module.exports = {
    save,
    one,
    list,
    update
}