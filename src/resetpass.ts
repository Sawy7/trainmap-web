// External imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'font-awesome/css/font-awesome.min.css';

import { FormUtilities } from "./formutilities";

document.addEventListener("DOMContentLoaded", () => {
    const passwordInputEdit = document.getElementById("passwordEdit") as HTMLInputElement;
    const passwordAgainInputEdit = document.getElementById("passwordAgainEdit") as HTMLInputElement;
    const submitButtonEdit = document.getElementById("submitButtonEdit") as HTMLButtonElement;

    passwordInputEdit.onkeyup = () => {
        FormUtilities.ValidatePassword(passwordInputEdit, passwordAgainInputEdit, submitButtonEdit);
    }

    passwordAgainInputEdit.onkeyup = () => {
        FormUtilities.ValidatePassword(passwordInputEdit, passwordAgainInputEdit, submitButtonEdit);
    }
});