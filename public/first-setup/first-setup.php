<?php
require __DIR__ . "/../vendor/autoload.php";

$db = new \PDO("pgsql:dbname=railway_mapdb;host=localhost;port=5432", "railway_map_app", "aeh7OhNui7shie");
$auth = new \Delight\Auth\Auth($db);

$userCount = $db->query("SELECT COUNT(*) as count FROM users;")->fetch()["count"];

if ($userCount > 0) {
    header("Location:/");
    exit;
}

try {
    $userId = $auth->register($_POST['email'], $_POST['password'], $_POST['username']);
    header("Location:/login");
    exit;
}
catch (\Delight\Auth\InvalidEmailException $e) {
    header("Location:/first-setup?error=wrong-email");
    exit;
}
catch (\Delight\Auth\InvalidPasswordException $e) {
    header("Location:/first-setup?error=wrong-pass");
    exit;
}
catch (\Delight\Auth\TooManyRequestsException $e) {
    header("Location:/first-setup?error=too-many-reqs");
    exit;
}
?>