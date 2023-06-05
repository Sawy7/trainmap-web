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

function buildGeoJSON($db, $sql, $params) {
    $geoJSON = [];
    $geoJSON["type"] = "FeatureCollection";
    $geoJSON["features"] = [];
    $geoJSON["status"] = null;

    // Try query or error
    $rs = $db->prepare($sql);
    $rs->execute($params);
    if (!$rs) {
        $geoJSON["status"] = "sqlerror";
        http_response_code(500);
        return json_encode($geoJSON);
    }

    while ($row = $rs->fetch(PDO::FETCH_ASSOC)) {
        $singleFeature = [];
        $singleFeature["type"] = "Feature";
        $singleFeature["geometry"] = json_decode($row["geojson"]);
        $singleFeature["properties"] = array_diff_key($row, array_flip(["geojson"]));
        $singleFeature["status"] = "ok";
        array_push($geoJSON["features"], $singleFeature);
    }

    if (empty($geoJSON["features"])) {
        $geoJSON["status"] = "nodata";
    } else {
        $geoJSON["status"] = "ok";
    }
    return json_encode($geoJSON);
}

function buildRailListJSON($db, $sql) {
    $json = [];
    $json["type"] = "RailList";
    $json["layers"] = null;
    $json["status"] = null;

    // Try query or error
    $rs = $db->query($sql);
    if (!$rs) {
        $json["status"] = "sqlerror";
        http_response_code(500);
        return json_encode($json);
    }

    $json["layers"] = [];

    while ($row = $rs->fetch(PDO::FETCH_ASSOC)) {
        if (array_key_exists("tags", $row))
            $row["tags"] = json_decode($row["tags"]);
        else
            $row["tags"] = array([
                "tag_name" => "errors",
                "tag_values" => [
                    "OSM nezpracovaná" => 100
                ]
            ]);
        array_push($json["layers"], $row);
    }

    if (empty($json["layers"])) {
        $json["status"] = "nodata";
    } else {
        $json["status"] = "ok";
    }
    return json_encode($json);
}
?>
