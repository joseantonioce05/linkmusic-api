const validator = require("validator");

const validate = (params) => {
  let resultado = false;

  let name =
    !validator.isEmpty(params.name) &&
    validator.isLength(params.name, { min: 3, max: undefined }) &&
    validator.isAlpha(params.name, "es-ES");

  let username =
    !validator.isEmpty(params.username) &&
    validator.isLength(params.username, { min: 4, max: 60 });

  let email =
    !validator.isEmpty(params.email) && validator.isEmail(params.email);

  let password = !validator.isEmpty(params.password);

  if (params.surname) {
    let surname =
      !validator.isEmpty(params.surname) &&
      validator.isLength(params.surname, { min: 3, max: undefined }) &&
      validator.isAlpha(params.surname, "es-ES");

    if (!surname) {
      throw new Error(
        "No se ha superado la validacion por apellido incorrecto"
      );
    } else {
      console.log("Validacion superada en el apellido");
    }
  }

  if (!name || !username || !email || !password) {
    throw new Error("No se ha superado la validacion");
  } else {
    console.log("Validacion superada");
    resultado = true;
  }

  return resultado;
};

module.exports = validate;