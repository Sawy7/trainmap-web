<?php
require __DIR__ . "/../config.php";
require __DIR__ . "/../vendor/autoload.php";

try {
    $db = new \PDO("pgsql:dbname=" . $DB_DBNAME . ";host=" . $DB_HOST . ";port=5432", $DB_USER, $DB_PASSWORD);
}
catch (PDOException $Exception) {
    echo 'Could not connect to service';
    exit;
}
$auth = new \Delight\Auth\Auth($db);

try {
    $auth->logOutEverywhere();
}
finally {
    header("Location:/login");
    exit;
}
?>
