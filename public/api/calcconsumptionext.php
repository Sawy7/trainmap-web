<?php
/**
 * PostGIS to GeoJSON
 * Link to original: https://gist.github.com/bmcbride/1913855
 * Modified by Sawy7
 * Query a PostGIS table or view and return the results in GeoJSON format, suitable for use in OpenLayers, Leaflet, etc.
 * 
 * @param 		string		$relcislo       The OSM relation id *REQUIRED*
 * @param 		string		$station_ids    The OSM relation id *REQUIRED*
 * @return 		string					    resulting json string
 */

header("Access-Control-Allow-Origin: *"); // NOTE: This can be configured in Apache
header("Content-Type: application/json");

// Retrive JSON variables
$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['relcislo'])) {
    echo '{"type": "MissingParameter", "name": "relcislo"}';
    http_response_code(400);
    exit;
} else
    $relcislo = $data['relcislo'];

if (empty($data['station_ids'])) {
    echo '{"type": "MissingParameter", "name": "station_ids"}';
    http_response_code(400);
    exit;
} else
    $station_ids = $data['station_ids'];


require "apibase.php";

// Get linestring
$sql = "SELECT ST_AsGeoJSON(ST_Collect($geomfield)) AS geojson FROM (
SELECT (ST_DumpPoints(geom)).geom FROM even_processed_routes_line WHERE relcislo = ?
) AS all_points;";

// Try query or error
$rs = $db->prepare($sql);
$rs->execute([$relcislo]);
if (!$rs) {
    echo '{ "type": "Consumption", "Data": null, "status": "sqlerror" }';
    http_response_code(500);
    exit;
}

$apiInputData = new stdClass();

while ($row = $rs->fetch()) {
    $apiInputData->coordinates = json_decode($row["geojson"])->coordinates;
}

// Get station_orders
$placeholders = rtrim(str_repeat('?, ', count($station_ids)), ', ') ;
$sql = "SELECT all_stations.name AS name, ST_AsGeoJSON(even_station_relation.$geomfield) AS geom,
even_station_relation.relcislo AS relcislo, all_stations.id as station_id, even_station_relation.station_order
FROM even_station_relation JOIN
all_stations ON even_station_relation.station_id = all_stations.id
WHERE relcislo = ? AND station_id IN ($placeholders)
ORDER BY even_station_relation.relcislo, station_order";

// Try query or error
$sql_params = array_merge([$relcislo], $station_ids);
$rs = $db->prepare($sql);
$rs->execute($sql_params);
if (!$rs) {
    echo '{ "type": "Consumption", "Data": null, "status": "sqlerror" }';
    http_response_code(500);
    exit;
}

$apiInputData->station_orders = [];

while ($row = $rs->fetch()) {
    array_push($apiInputData->station_orders, $row["station_order"]);
}

// Get velocity_ways
$sql = "SELECT start_order, end_order, maxspeed
FROM even_way_relation JOIN
osm_ways ON even_way_relation.way_id = osm_ways.id
WHERE relcislo = ?";

// Try query or error
$rs = $db->prepare($sql);
$rs->execute([$relcislo]);
if (!$rs) {
    echo '{ "type": "Consumption", "Data": null, "status": "sqlerror" }';
    http_response_code(500);
    exit;
}

$apiInputData->velocity_ways = [];

while ($row = $rs->fetch()) {
    array_push($apiInputData->velocity_ways, ["start" => $row["start_order"], "end" => $row["end_order"], "velocity" => $row["maxspeed"]]);
}

// echo json_encode($apiInputData);
// exit;

$options = array(
    "http" => array(
        "header"  => "Content-type: application/json\r\n",
        "method"  => "POST",
        "content" => json_encode($apiInputData)
    )
);
$context  = stream_context_create($options);
$result = file_get_contents($CONSUM_API_HOST, false, $context);

if (!$rs) {
    echo '{ "type": "Consumption", "Data": null, "status": "apierror" }';
    http_response_code(500);
    exit;
}

$apiOutputData = (object) array_merge((array) $apiInputData, (array) json_decode($result));

echo '{ "type": "Consumption", "Data": ' . json_encode($apiOutputData) . ', "status": "ok" }';
?>