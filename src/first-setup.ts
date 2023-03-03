// External imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'font-awesome/css/font-awesome.min.css';

let emailInput = document.getElementById("email") as HTMLInputElement;
let passwordInput = document.getElementById("password") as HTMLInputElement;
let passwordAgainInput = document.getElementById("passwordAgain") as HTMLInputElement;
let submitButton = document.getElementById("submitButton") as HTMLButtonElement;

// TODO: Better validation (e-mail, complex password)
function ValidateInputs() {
    if (passwordInput.value == passwordAgainInput.value && passwordInput.value.length > 0)
        submitButton.disabled = false;
    else
        submitButton.disabled = true;
}

emailInput.onkeyup = ValidateInputs;
passwordInput.onkeyup = ValidateInputs;
passwordAgainInput.onkeyup = ValidateInputs;
