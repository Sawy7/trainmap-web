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
    <script src="/admin/admin.js"></script>
    <!-- Custom Styles -->
    <link rel="stylesheet" href="/admin/admin.css">
</head>

<body>
    <div class="container-fluid min-vh-100 d-flex flex-column">
        <div class="row flex-grow-1">
            <?php $page = "/admin";
            include("menu.php"); ?>
            <div class="col-md">
                <div class="container">
                    <br>
                    <h1>Vítejte v admin panelu!</h1>
                    <p>Pomocí menu na levé straně se dostanete ke správě různých aspektů aplikace.</p>
                </div>
            </div>
        </div>
    </div>
</body>

</html>