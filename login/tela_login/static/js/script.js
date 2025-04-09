function ValidateEmail(input) {
	console.log("Validation chamada0")
  var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  if (input.value.match(validRegex)) {
	console.log("Email Válido")

    return true;

  } else {
	console.log("Email inválido")
    alert("Email inválido!");

    return false;

  }

}
