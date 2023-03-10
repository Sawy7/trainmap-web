<?php
require __DIR__ . "/../config.php";
require __DIR__ . "/../vendor/autoload.php";

try {
    $db = new \PDO("pgsql:dbname=" . $DB_DBNAME . ";host=" . $DB_HOST . ";port=5432", $DB_USER, $DB_PASSWORD);
}
catch (PDOException $Exception) {
    echo '{ "type": "Error", "cause": "Could not connect to service" }';
    exit;
}
$auth = new \Delight\Auth\Auth($db);

if (!$auth->isLoggedIn()) {
    header("Content-Type: application/json");
    http_response_code(401);
    echo '{ "type": "Error", "cause": "Not logged in" }';
    exit;
}

// Common Constants
$geomfield = "geom";
$srid = "4326"; // WGS-84 (GPS)

// Connect to PostgreSQL database
$conn = @pg_connect("dbname='" . $DB_DBNAME . "' user=" . $DB_USER . " password='" . $DB_PASSWORD . "' host='" . $DB_HOST . "'");

function createJsonKey($name, $value, $isNumber=false) {
    $result = '"' . $name . '": ';

    if (is_null($value))
    {
        $value = "null";
        $isNumber = true;
    } else if ($value == "f") {
        $value = "false";
        $isNumber = true;
    } else if ($value == "t") {
        $value = "true";
        $isNumber = true;
    }

    if ($isNumber) {
        $result .= $value;
    } else {
        $result .= '"' . $value . '"';
    }
    return $result;
}
?>
