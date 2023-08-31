// External imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'font-awesome/css/font-awesome.min.css';

// Internal imports
import { FormUtilities } from './formutilities';

document.addEventListener("DOMContentLoaded", () => {
    let passwordInput = document.getElementById("password") as HTMLInputElement;
    let passwordAgainInput = document.getElementById("passwordAgain") as HTMLInputElement;
    let submitButton = document.getElementById("submitButton") as HTMLButtonElement;

    passwordInput.onkeyup = () => {
        FormUtilities.ValidatePassword(passwordInput, passwordAgainInput, submitButton);
    };
    passwordAgainInput.onkeyup = () => {
        FormUtilities.ValidatePassword(passwordInput, passwordAgainInput, submitButton);
    };
});