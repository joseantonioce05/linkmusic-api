const bcrypt = require("bcrypt");
const validate = require("../helpers/validate");
const User = require("../models/user");

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

        //Guardamos el usuario
        const savedUser = await userToSave.save();

        //Borramos del usuario creado la contraseña y rol por seguridad para enseñarlo en la respuesta
        let userCreated = savedUser.toObject();
        delete userCreated.password;
        delete userCreated.role;

        return res.status(200).send({
            status: "success",
            message: "Metodo de registro",
            userCreated
        });
        
    } catch (error) {
        return res.status(500).json({
            status: "Error",
            message: "Error en la consulta de usuarios"
        });
    }; 
};

const login = (req, res) => {

    return res.status(200).send({
        status: "success",
        message: "Metodo de login"
    })
}

module.exports = {
    register,
    login,
}