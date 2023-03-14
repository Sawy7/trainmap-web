<?php
require __DIR__ . "/../config.php";
require __DIR__ . "/../vendor/autoload.php";

try {
    $db = new \PDO("pgsql:dbname=" . $DB_DBNAME . ";host=" . $DB_HOST . ";port=5432", $DB_USER, $DB_PASSWORD);
} catch (PDOException $Exception) {
    echo 'Could not connect to service';
    exit;
}
$auth = new \Delight\Auth\Auth($db);

if (!$auth->hasRole(\Delight\Auth\Role::ADMIN)) {
    header("Location:/");
    exit;
}
?>
<!doctype html>

<html lang="cz">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Mapster - Admin panel</title>

    <!-- Scripts -->
    <script src="/admin/admin.js"></script>
    <!-- Custom Styles -->
    <link rel="stylesheet" href="/admin/admin.css">
</head>

<body>
    <div class="container-fluid min-vh-100 d-flex flex-column">
        <div class="row flex-grow-1">
            <?php $page = "/admin/users.php";
            include("menu.php"); ?>
            <div class="col-md">
                <div class="container">
                    <br>
                    <h1>Uživatelé</h1>
                    <div class="row">
                        <div id="userInfo" class="col-md">
                            <h4>Operace</h4>
                            <div class="btn-group" role="group" aria-label="operationButtons" style="width: 100%">
                                <button type="button" class="btn btn-danger">Odstranit</button>
                                <button type="button" class="btn btn-warning">Deaktivovat</button>
                            </div>
                            <br><br>
                            <div class="accordion" id="operationAccordion">
                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="headingPass">
                                        <button class="accordion-button collapsed" type="button"
                                            data-bs-toggle="collapse" data-bs-target="#collapsePass"
                                            aria-expanded="true" aria-controls="collapsePass">
                                            Změnit heslo
                                        </button>
                                    </h2>
                                    <div id="collapsePass" class="accordion-collapse collapse"
                                        aria-labelledby="headingPass" data-bs-parent="#operationAccordion">
                                        <div class="accordion-body">
                                            <form action="NEW_ACTION_HERE" method="post">
                                                <div class="form-group">
                                                    <label>Heslo</label>
                                                    <input id="password" name="password" class="form-control"
                                                        type="password">
                                                </div>
                                                <br>
                                                <div class="form-group">
                                                    <label>Heslo znovu</label>
                                                    <input id="passwordAgain" class="form-control" type="password">
                                                </div>
                                                <br>
                                                <div class="form-group">
                                                    <button id="submitButton" type="submit"
                                                        class="btn btn-primary btn-block float-end"
                                                        disabled>Změnit</button>
                                                    <br><br>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="headingPerms">
                                        <button class="accordion-button collapsed" type="button"
                                            data-bs-toggle="collapse" data-bs-target="#collapsePerms"
                                            aria-expanded="true" aria-controls="collapsePerms">
                                            Nastavit oprávnění
                                        </button>
                                    </h2>
                                    <div id="collapsePerms" class="accordion-collapse collapse"
                                        aria-labelledby="headingPerms" data-bs-parent="#operationAccordion">
                                        <div class="accordion-body">
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" name="radioAdmin"
                                                    id="radioAdmin" checked>
                                                <label class="form-check-label" for="radioAdmin">
                                                    Administrátor
                                                </label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" name="radioNormal"
                                                    id="radioNormal">
                                                <label class="form-check-label" for="radioNormal">
                                                    Normální uživatel
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="userList" class="list-group col-md-4">
                            <h4>Seznam uživatelů</h4>
                            <a href="#" class="list-group-item list-group-item-action active">user@mail.com</a>
                            <a href="#" class="list-group-item list-group-item-action">user@mail.com</a>
                            <a href="#" class="list-group-item list-group-item-action">user@mail.com</a>
                            <a href="#" class="list-group-item list-group-item-action">user@mail.com</a>
                            <a href="#" class="list-group-item list-group-item-action">user@mail.com</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>

</html>