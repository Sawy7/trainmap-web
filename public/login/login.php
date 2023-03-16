<?php
require __DIR__ . "/../dbbase.php";

$auth = new \Delight\Auth\Auth($db);

try {
    $auth->login($_POST["email"], $_POST["password"]);
    header("Location:/");
    exit;
}
catch (\Delight\Auth\InvalidEmailException $e) {
    header("Location:/login?error=wrong-email");
    exit;
}
catch (\Delight\Auth\InvalidPasswordException $e) {
    header("Location:/login?error=wrong-pass");
    exit;
}
catch (\Delight\Auth\TooManyRequestsException $e) {
    header("Location:/first-setup?error=too-many-reqs");
    exit;
}
?>
