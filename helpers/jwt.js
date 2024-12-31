const jwt = require("jwt-simple");
const moment = require("moment");

const secret = process.env.SECRET_PASSWORD;

const createToken = (user) => {

    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        username: user.username,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix()
    };

    return jwt.encode(payload, secret);
}

module.exports = {
    secret,
    createToken
}