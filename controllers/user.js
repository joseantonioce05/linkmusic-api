const bcrypt = require("bcrypt");
const validate = require("../helpers/validate");
const fs = require("fs");
const path = require("path");
const User = require("../models/user");
const jwt = require("../helpers/jwt");
const mongoose = require('mongoose');
const { populate } = require("dotenv");

const register = async (req, res) => {
    let params = req.body;

    //Validaciones para comprobar que el usuario puso informacion correcta
    if (!params.name || !params.username || !params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar"
        })
    }

    try {
        validate(params);
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: "Validacion no superada"
        })
    }

    //Verificacion de si el usuario no exista
    try {
        const existingUsers = await User.find({
            $or: [
                { email: params.email.toLowerCase() },
                { username: params.username.toLowerCase() }
            ]
        }).exec();
        
        if (existingUsers && existingUsers.length >= 1) {
            return res.status(200).send({
                status: "success",
                messague: "El usuario ya existe"
            });
        }

        //Ciframos la contraseña
        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;

        //Hacemos una instacia de usuario
        let userToSave = new User(params);
        userToSave.username = userToSave.username.toLowerCase()

        //Guardamos el usuario
        const savedUser = await userToSave.save();

        //Hacemos el JSON un objecto y borramos del usuario creado la contraseña y rol por seguridad para enseñarlo en la respuesta
        let userCreated = savedUser.toObject();
        delete userCreated.password;
        delete userCreated.role;

        return res.status(200).send({
            status: "success",
            message: "Usuario registrado",
            userCreated
        });
        
    } catch (error) {
        return res.status(500).json({
            status: "Error",
            message: "Error en la consulta de usuarios"
        });
    }; 
};

const login = async (req, res) => {
    let params = req.body;

    //Comprobacion que el usuario envio correctamente los datos para logear
    if(!params.username || !params.password){
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    //Consultado el usuario con el email propocionado por el usuario
    const existUser = await User.findOne({username: params.username.toLowerCase()}).select("+password +role").exec();

    //Comprobando que el usuario existe 
    if(existUser.length == 0){
        return res.status(404).send({
            status: "error",
            message: "No existe el usuario"
        });
    }

    //Comprabando que la contraseña es correcta
    const pwd = bcrypt.compareSync(params.password, existUser.password);

    if(!pwd){
        return res.status(400).send({
            status: "error",
            message: "Contraseña incorrecta"
        });
    }

    //Limpiamos la contraseña
    let identityUser = existUser.toObject();
    delete identityUser.password;
    delete identityUser.role;

    const token = jwt.createToken(existUser);

    return res.status(200).send({
        status: "success",
        message: "Login completado",
        user: identityUser,
        token
    });
}

const profile = async (req, res) => {

    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            status: 'error',
            message: 'ID no válido',
        });
    }

    const user = await User.findOne({_id: id}).select("+role").populate({path: "song_favorite", populate: { path: "album", populate: {path: "artist"}}});

    return res.status(200).send({
        status: "success",
        message: "Metodo de perfil",
        user: user
    });
}

const update = async (req, res) => {
    //Usuario identificado 
    let userIdentity = req.user;

    //Informacion para actualizar
    let userToUpdate = req.body;

    //Validacion
    try {
        validate(userToUpdate);
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: "Validacion no superada"
        })
    }

    //Buscando el usuario propocionado
    const existUsers = await User.find({
        $or: [
            {email: userToUpdate.email.toLowerCase()},
            {username: userToUpdate.username.toLowerCase()}
        ]
    }).exec();

    //Verificando que exista el usuario
    if(existUsers.lenght == 0){
        return res.status(500).send({
            status: "error",
            message: "Error en la consulta de usuario",
        });
    }


    let userIsset = false;

    //Verificando si ya existe el usuario antes de actualizar
    existUsers.forEach(existUser => {
        if(existUser && existUser._id != userIdentity.id) userIsset = true;
    })

    if(userIsset){
        return res.status(200).send({
            status: "success",
            message: "El usuario ya existe",
        });
    }

    //Actualizando contraseña si la quiere cambiar el usuario
    if(userToUpdate.password) {
        let pwd = await bcrypt.hash(userToUpdate.password, 10);
        userToUpdate.password = pwd;
    } else {
        delete userToUpdate.password;
    }

    //Actualizando usuario
    try {
        let userUpdated = await User.findByIdAndUpdate({_id: userIdentity.id}, userToUpdate, {new: true});

        if(!userUpdated) {
            return res.status(500).send({
                status: "error",
                message: "Error al actualizar",
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Metodo de update",
            user: userUpdated
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al actualizar",
        });
    }
}

const upload = async (req, res) => {

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

    const uploadUserAvatar = await User.findOneAndUpdate({_id: req.user.id}, {image: req.file.filename}, {new:true});
    console.log(uploadUserAvatar.image)

    if(!uploadUserAvatar.image) {
        return res.status(400).send({
            status: 'error',
            message: 'Hubo un error al subir la imagen',
        });
    }

    return res.status(200).send({
        status: "success",
        message: "Imagen subida",
        user: uploadUserAvatar,
        file: req.file
    });
}

const avatar = (req, res) => {
    const file = req.params.file;

    const filePath = "./uploads/avatars/" + file;
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

const song_favorite = async (req, res) => {
    const params = req.body;

    try {
        const savedSong = await User.findByIdAndUpdate(params.userId, {$push: {song_favorite: params.songId}})

        return res.status(200).send({
            status: "success",
            message: "Metodo de guardar favorito", 
        });

    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: "error",
            error: error
        });
    }
}

module.exports = {
    register,
    login,
    profile,
    update,
    upload,
    avatar,
    song_favorite
}