<?php
/**
 * PostGIS to GeoJSON
 * Link to original: https://gist.github.com/bmcbride/1913855
 * Modified by Sawy7
 * Query a PostGIS table or view and return the results in GeoJSON format, suitable for use in OpenLayers, Leaflet, etc.
 * 
 * @param 		string		$relcislo          The OSM relation id *REQUIRED*
 * @param 		string		$station_ids       The OSM relation id *REQUIRED*
 * @param 		string		$params            The vehicle params *REQUIRED*
 * @param 		string		$variable_params   Tuned simulation params params *REQUIRED*
 * @param 		boolean		$is_reversed       If the direction of the train is swapped
 * @return 		string					    resulting json string
 */

header("Access-Control-Allow-Origin: *"); // NOTE: This can be configured in Apache
// header("Content-Type: application/json");

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

if (empty($data['params'])) {
    echo '{"type": "MissingParameter", "name": "params"}';
    http_response_code(400);
    exit;
} else
    $params = $data['params'];

if (empty($data['variable_params'])) {
    echo '{"type": "MissingParameter", "name": "variable_params"}';
    http_response_code(400);
    exit;
} else
    $variable_params = $data['variable_params'];

if (empty($data['is_reversed']))
    $is_reversed = false;
else
    $is_reversed = $data['is_reversed'];

require "apibase.php";
require "consumptionbase.php";

$apiInputData = prepareRailGeo($db, $geomfield, $relcislo, $station_ids, $is_reversed);

$apiInputData->output_options = new stdClass();
$apiInputData->output_options->energy_in_kwh = true;
$apiInputData->params = $params;
$apiInputData->variable_params = $variable_params;

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
$apiInputData->rail_definition->coordinates = array_slice($apiInputData->rail_definition->coordinates, 0, $apiInputData->rail_definition->station_orders[count($apiInputData->rail_definition->station_orders) - 1]);
$apiInputData->rail_definition->coordinates = array_slice($apiInputData->rail_definition->coordinates, $apiInputData->rail_definition->station_orders[0]);
$offset = $apiInputData->rail_definition->station_orders[0];
foreach($apiInputData->rail_definition->station_orders as &$so) {
    $so -= $offset;
}
$apiInputData->rail_definition->station_orders[count($apiInputData->rail_definition->station_orders) - 1] = count($apiInputData->rail_definition->coordinates) - 1;

$apiOutputData = (object) array_merge((array) $apiInputData, (array) json_decode($result));

echo '{ "type": "Consumption", "Data": ' . json_encode($apiOutputData) . ', "status": "ok" }';
?>
