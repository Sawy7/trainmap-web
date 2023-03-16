// External imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'font-awesome/css/font-awesome.min.css';

// Internal imports
import { UsersApp } from './usersapp';
    
let app = UsersApp.Instance;

document.addEventListener("DOMContentLoaded", () => {
    app.Init();
});

