<?php
require __DIR__ . "/config.php";
require __DIR__ . "/vendor/autoload.php";

try {
    $db = new \PDO("pgsql:dbname=" . $DB_DBNAME . ";host=" . $DB_HOST . ";port=5432", $DB_USER, $DB_PASSWORD);
} catch (PDOException $Exception) {
    header("Content-Type: application/json");
    $json = [];
    $json["type"] = "generic";
    $json["status"] = "dberror";
    echo json_encode($json);
}
?>
