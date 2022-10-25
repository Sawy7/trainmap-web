<?php
header("Access-Control-Allow-Origin: *"); // NOTE: This can be configured in Apache
header("Content-Type: application/json");

// DB Connection Params
$DB_DBNAME = "map_data";
$DB_USER = "postgres";
$DB_PASSWORD = "mysecretpassword";
$DB_HOST = "localhost";

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
