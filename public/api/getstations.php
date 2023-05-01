<?php
/**
 * PostGIS to GeoJSON
 * Link to original: https://gist.github.com/bmcbride/1913855
 * Modified by Sawy7
 * Query a PostGIS table or view and return the results in GeoJSON format, suitable for use in OpenLayers, Leaflet, etc.
 * 
 * @param 		string		$relcisla	The OSM relation id *REQUIRED*
 * @return 		string					resulting geojson string
 */

header("Access-Control-Allow-Origin: *"); // NOTE: This can be configured in Apache
header("Content-Type: application/json");

// Retrive JSON variables
$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['relcisla'])) {
    echo '{"type": "MissingParameter", "name": "relcisla"}';
    exit;
} else
    $relcisla = $data['relcisla'];

require "apibase.php";

// Build SQL SELECT statement and return the geometry as a GeoJSON element in EPSG: 4326
$placeholders = rtrim(str_repeat('?, ', count($relcisla)), ', ') ;
$sql = "SELECT all_stations.name, ST_AsGeoJSON(station_relation.$geomfield) AS geom,
station_relation.relcislo AS relcislo, all_stations.id, station_relation.station_order AS order
FROM station_relation JOIN
all_stations ON station_relation.station_id = all_stations.id
WHERE relcislo IN ($placeholders)
ORDER BY station_relation.relcislo, station_order";
// echo $sql;

// Build stationJSON
$stationJSON = [];
$stationJSON["type"] = "Stations";
$stationJSON["Collections"] = [];
$stationJSON["status"] = null;

// Try query or error
$rs = $db->prepare($sql);
$rs->execute($relcisla);
if (!$rs) {
    $stationJSON["status"] = "sqlerror";
    http_response_code(500);
    echo json_encode($stationJSON);
    exit;
}

$singleCollection = [];
$singleCollection["type"] = "FeatureCollection";
$singleCollection["features"] = [];
$singleCollection["properties"] = [];
$singleCollection["properties"]["relcislo"] = null;

while ($row = $rs->fetch(PDO::FETCH_ASSOC)) {
    if ($singleCollection["properties"]["relcislo"] != NULL && $singleCollection["properties"]["relcislo"] != $row["relcislo"]) {
        array_push($stationJSON["Collections"], $singleCollection);
        $singleCollection["features"] = [];
    }
    $singleCollection["properties"]["relcislo"] = $row["relcislo"];

    $singleStation = [];
    $singleStation["type"] = "Feature";
    $singleStation["geometry"] = json_decode($row[$geomfield]);

    $singleStation["properties"] = [];
    $singleStation["properties"]["id"] = intval($row["id"]);
    $singleStation["properties"]["name"] = $row["name"];
    $singleStation["properties"]["order"] = $row["order"];

    array_push($singleCollection["features"], $singleStation);
}
array_push($stationJSON["Collections"], $singleCollection);

if ($singleCollection["properties"]["relcislo"] == null) {
    $stationJSON["status"] = "nodata";
    http_response_code(500);
} else {
    $stationJSON["status"] = "ok";
}
echo json_encode($stationJSON);
?>