<?php
require __DIR__ . "/../dbbase.php";

$auth = new \Delight\Auth\Auth($db);

if ($auth->isLoggedIn()) {
    header("Location:/");
    exit;
}
?>
<!doctype html>

<html lang="cz">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Mapster - Nové heslo</title>

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
                        echo("E-mailová adresa neexistuje");
                    elseif ($_GET["error"] == "wrong-pass")
                        echo("Heslo není správné");
                    elseif ($_GET["error"] == "too-many-reqs")
                        echo("Byl zaznamenán velký počet pokusů o přihlášení");
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
                    <!-- <a href="" class="float-right btn btn-outline-primary">Sign up</a> -->
                    <h4 class="card-title mb-4 mt-1">Vytvořte si nové heslo</h4>
                    <form action="/resetpass/resetpass.php" method="post">
                        <input name="selector" class="form-control bg-dark text-light" type="text" value="<?php echo $_GET['selector'] ?>" style="display: none">
                        <input name="token" class="form-control bg-dark text-light" type="text" value="<?php echo $_GET['token'] ?>" style="display: none">
                        <div class="form-group">
                            <label>E-mailová adresa</label>
                            <input name="email" class="form-control bg-dark text-light" type="email" value="<?php echo $_GET['email'] ?>" disabled>
                        </div>
                        <br>
                        <div class="form-group">
                            <label>Heslo</label>
                            <input name="password" id="passwordEdit" class="form-control bg-dark text-light" type="password">
                        </div> 
                        <br>
                        <div class="form-group">
                            <label>Heslo znovu</label>
                            <input name="password" id="passwordAgainEdit" class="form-control bg-dark text-light" type="password">
                        </div> 
                        <br>
                        <div class="form-group">
                            <button type="submit" id="submitButtonEdit" class="btn btn-primary btn-block float-end" disabled>Vytvořit</button>
                        </div>                                                           
                    </form>
                </article>
            </div>
        </div>
    </div>

    <script src="/resetpass/resetpass.js"></script>
</body>
</html>
