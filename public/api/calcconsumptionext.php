<?php
/**
 * PostGIS to GeoJSON
 * Link to original: https://gist.github.com/bmcbride/1913855
 * Modified by Sawy7
 * Query a PostGIS table or view and return the results in GeoJSON format, suitable for use in OpenLayers, Leaflet, etc.
 * 
 * @param 		string		$relcislo       The OSM relation id *REQUIRED*
 * @param 		string		$station_ids    The OSM relation id *REQUIRED*
 * @param 		boolean		$is_reversed    If the direction of the train is swapped
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

if (empty($data['is_reversed']))
    $is_reversed = false;
else
    $is_reversed = $data['is_reversed'];

require "apibase.php";

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

$apiInputData = new stdClass();
$apiInputData->station_orders = [];

while ($row = $rs->fetch()) {
    array_push($apiInputData->station_orders, $row["station_order"]);
}

// Get linestring
$sql = "SELECT ST_AsGeoJSON(ST_Collect($geomfield)) AS geojson FROM (
SELECT (ST_DumpPoints(geom)).geom FROM even_processed_routes_line_dtm
WHERE relcislo = ?
ORDER BY (ST_DumpPoints(geom)).path[1]";

if ($is_reversed)
    $sql .= " DESC";

$sql .= ") AS all_points;";

// Try query or error
$rs = $db->prepare($sql);
$rs->execute([$relcislo]);
if (!$rs) {
    echo '{ "type": "Consumption", "Data": null, "status": "sqlerror" }';
    http_response_code(500);
    exit;
}

while ($row = $rs->fetch()) {
    $apiInputData->coordinates = json_decode($row["geojson"])->coordinates;
}

if ($is_reversed) {
    $pointCount = count($apiInputData->coordinates);
    foreach($apiInputData->station_orders as &$so) {
        $so = $pointCount-1-$so;
    }
    $apiInputData->station_orders = array_reverse($apiInputData->station_orders);
}

// Get velocity_ways
$sql = "SELECT start_order, end_order, maxspeed
FROM get_even_route_line_ways(?) AS ewr JOIN
osm_ways ON ewr.way_id = osm_ways.id
WHERE relcislo = ?";

// Try query or error
$rs = $db->prepare($sql);
$rs->execute([$relcislo, $relcislo]);
if (!$rs) {
    echo '{ "type": "Consumption", "Data": null, "status": "sqlerror" }';
    http_response_code(500);
    exit;
}

$apiInputData->velocity_ways = [];

while ($row = $rs->fetch()) {
    array_push($apiInputData->velocity_ways, ["start" => $row["start_order"], "end" => $row["end_order"], "velocity" => $row["maxspeed"]]);
}

$apiInputData->mass_locomotive_kg = $data["mass_locomotive_kg"];
$apiInputData->mass_wagon_kg = $data["mass_wagon_kg"];
$apiInputData->power_limit_kw = $data["power_limit_kw"];
$apiInputData->recuperation_coef = $data["recuperation_coef"];
$apiInputData->energy_in_kwh = true;

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
$apiUrl = "http";
if ($CONSUM_API_TLS)
    $apiUrl .= "s://";
else
    $apiUrl .= "://";
$apiUrl .= $CONSUM_API_HOST . ":" . $CONSUM_API_PORT . "/" . $CONSUM_API_ENDPOINT;
$result = file_get_contents($apiUrl, false, $context);

if (!$result) {
    echo '{ "type": "Consumption", "Data": null, "status": "apierror" }';
    http_response_code(500);
    exit;
}

// Crop linestring to stations
$apiInputData->coordinates = array_slice($apiInputData->coordinates, 0, $apiInputData->station_orders[count($apiInputData->station_orders) - 1]);
$apiInputData->coordinates = array_slice($apiInputData->coordinates, $apiInputData->station_orders[0] - 1);
$offset = $apiInputData->station_orders[0];
foreach($apiInputData->station_orders as &$so) {
    $so -= $offset;
}
$apiInputData->station_orders[count($apiInputData->station_orders) - 1] = count($apiInputData->coordinates) - 1;

$apiOutputData = (object) array_merge((array) $apiInputData, (array) json_decode($result));

echo '{ "type": "Consumption", "Data": ' . json_encode($apiOutputData) . ', "status": "ok" }';
?>