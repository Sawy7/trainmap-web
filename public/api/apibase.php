<?php
require __DIR__ . "/../dbbase.php";

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
