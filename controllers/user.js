const bcrypt = require("bcrypt");
const validate = require("../helpers/validate");
const User = require("../models/user");
const jwt = require("../helpers/jwt");

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
    if(!params.email || !params.password){
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    //Consultado el usuario con el email propocionado por el usuario
    const existUser = await User.findOne({email: params.email.toLowerCase()}).select("+password +role").exec();

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

module.exports = {
    register,
    login,
}