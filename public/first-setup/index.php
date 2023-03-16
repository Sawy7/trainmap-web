<?php
require __DIR__ . "/../dbbase.php";

$auth = new \Delight\Auth\Auth($db);

$userCount = $db->query("SELECT COUNT(*) as count FROM users;")->fetch()["count"];

if ($userCount > 0) {
    header("Location:/");
    exit;
}
?>
<!doctype html>

<html lang="cz">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Mapster - První spuštění</title>

    <!-- Custom Styles -->
    <link rel="stylesheet" href="/login/login.css">
</head>

<body>
    <div id="bgVideoDiv">
        <video autoplay muted loop>
            <!--Royalty free background video by Kelly: https://www.pexels.com/video/top-view-of-a-train-passing-by-the-railroad-4336523/-->
            <source src="/login/river_rail_kelly_pexels.mp4" type="video/mp4">
        </video>
    </div>

    <div id="alertPlace" style="position: absolute; width: 100%">
            <?php
                if (isset($_GET["error"])) {
                    echo('<div class="alert alert-danger alert-dismissible" role="alert"><b>Nepodařilo se přihlásit: </b>');
                    if ($_GET["error"] == "wrong-email")
                        echo("Špatný formát e-mailové adresy");
                    elseif ($_GET["error"] == "wrong-pass")
                        echo("Heslo není dostatečné");
                    elseif ($_GET["error"] == "too-many-reqs")
                        echo("Byl zaznamenán velký počet pokusů o registraci");
                    else
                        echo("Neznámá chyba");
                    echo('</div>');
                }
            ?>
    </div>
    
    <div class="container">
        <div class="row align-items-center col-6 offset-3" style="min-height: 100vh">
            <div class="card bg-dark">
                <article class="card-body text-light">
                    <h4 class="card-title mb-4 mt-1">Tvorba administrátorského účtu</h4>
                    <form action="/first-setup/first-setup.php" method="post">
                        <div class="form-group">
                            <label>E-mailová adresa</label>
                            <input id="email" name="email" class="form-control bg-dark text-light" type="email">
                        </div>
                        <br>
                        <div class="form-group">
                            <label>Heslo</label>
                            <input id="password" name="password" class="form-control bg-dark text-light" type="password">
                        </div>
                        <br>
                        <div class="form-group">
                            <label>Heslo znovu</label>
                            <input id="passwordAgain" class="form-control bg-dark text-light" type="password">
                        </div> 
                        <br>
                        <div class="form-group">
                            <button id="submitButton" type="submit" class="btn btn-primary btn-block float-end" disabled>Vytvořit</button>
                        </div>                                                           
                    </form>
                </article>
            </div>
        </div>
    </div>

    <script src="/first-setup/first-setup.js"></script>
</body>
</html>
