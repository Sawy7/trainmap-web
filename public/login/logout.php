<?php
require __DIR__ . "/../vendor/autoload.php";

$db = new \PDO("pgsql:dbname=railway_mapdb;host=localhost;port=5432", "railway_map_app", "aeh7OhNui7shie");
$auth = new \Delight\Auth\Auth($db);

try {
    $auth->logOutEverywhere();
}
finally {
    header("Location:/login");
    exit;
}
?>
