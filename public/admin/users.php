<?php
require __DIR__ . "/../dbbase.php";

$auth = new \Delight\Auth\Auth($db);

if (!$auth->hasRole(\Delight\Auth\Role::ADMIN)) {
    $_SESSION["redirect"] = $_SERVER["REQUEST_URI"];
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
    <script src="/admin/users.js"></script>
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
                            <div id="operationsPlaceholder">
                                <p>Nebyl vybrán žádný uživatel</p>
                            </div>
                            <div id="editOperations" style="display: none">
                                <div class="btn-group" role="group" aria-label="operationButtons" style="width: 100%">
                                    <button id="delUserButton" type="button" class="btn btn-danger">Odstranit</button>
                                    <button id="deactivateUserButton" type="button" class="btn btn-warning" disabled>Deaktivovat</button>
                                </div>
                                <br><br>
                                <div class="accordion" id="operationAccordion">
                                    <div class="accordion-item" id="changePassAccordion">
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
                                                <div class="form-group">
                                                    <label>Heslo</label>
                                                    <input id="passwordEdit" class="form-control"
                                                        type="password">
                                                </div>
                                                <br>
                                                <div class="form-group">
                                                    <label>Heslo znovu</label>
                                                    <input id="passwordAgainEdit" class="form-control" type="password">
                                                </div>
                                                <br>
                                                <div class="form-group">
                                                    <button id="submitButtonEdit" type="submit"
                                                        class="btn btn-primary btn-block float-end"
                                                        disabled>Změnit</button>
                                                    <br><br>
                                                </div>
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
                                                    <input class="form-check-input" type="radio" name="roleRadio"
                                                        id="radioAdmin" checked>
                                                    <label class="form-check-label" for="radioAdmin">
                                                        Administrátor
                                                    </label>
                                                </div>
                                                <div class="form-check">
                                                    <input class="form-check-input" type="radio" name="roleRadio"
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
                            <div id="newUserOperations" style="display: none">
                                <h5>Nový uživatel</h5>
                                <div class="form-group">
                                    <label>E-mailová adresa</label>
                                    <input id="emailNew" class="form-control" type="email">
                                </div>
                                <br>
                                <div class="form-group">
                                    <label>Heslo</label>
                                    <input id="passwordNew" name="password" class="form-control" type="password">
                                </div>
                                <br>
                                <div class="form-group">
                                    <label>Heslo znovu</label>
                                    <input id="passwordAgainNew" class="form-control" type="password">
                                </div>
                                <br>
                                <div class="form-group">
                                    <button id="submitButtonNew" class="btn btn-primary btn-block float-end"
                                        disabled>Vytvořit účet</button>
                                    <br><br>
                                </div>
                            </div>
                            <br>
                        </div>
                        <div class="col-md-12 col-lg-5">
                            <h4>Seznam uživatelů</h4>
                            <span class="badge bg-primary rounded-pill user-pill" style="display: none"><i class="bi bi-person-fill"></i></span>
                            <span class="badge bg-danger rounded-pill admin-pill" style="display: none"><i class="bi bi-suit-spade-fill"></i></span>
                            <div id="userList" class="list-group">
                                <!-- <a href="#" class="list-group-item list-group-item-action active">user@mail.com</a> -->
                                <?php
                                $users = $db->query("SELECT email, roles_mask FROM users;")->fetchAll();
                                foreach ($users as $u) {
                                    echo ('<a href="#" class="list-group-item d-flex justify-content-between align-items-center" value="' . $u["roles_mask"] . '">');
                                    echo ('<span class="mail">' . $u["email"] . '</span>');
                                    if ($u["roles_mask"] == 0)
                                        echo (' <span class="badge bg-primary rounded-pill user-pill"><i class="bi bi-person-fill"></i></span>');
                                    else if ($u["roles_mask"] == 1)
                                        echo (' <span class="badge bg-danger rounded-pill admin-pill"><i class="bi bi-suit-spade-fill"></i></span>');
                                    echo ('</a>');
                                }
                                // <a href="#" class="list-group-item list-group-item-action">user@mail.com</a>
                                ?>
                            </div>
                            <br>
                            <div class="list-group">
                                <a class="list-group-item list-group-item-success text-center" href="#"
                                    id="addUserButton">
                                    <i class="bi-plus"></i> Přidat uživatele
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>

</html>