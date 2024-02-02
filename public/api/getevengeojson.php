<?php
/**
 * PostGIS to GeoJSON
 * Link to original: https://gist.github.com/bmcbride/1913855
 * Modified by Sawy7
 * Query a PostGIS table or view and return the results in GeoJSON format, suitable for use in OpenLayers, Leaflet, etc.
 * 
 * @param 		string		$relcislo          The OSM relation id *REQUIRED*
 * @param 		string		$station_ids       The OSM relation id *REQUIRED*
 * @param 		boolean		$is_reversed       If the direction of the train is swapped
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
require "consumptionbase.php";

$apiInputData = ["type" => "LineString"];
$apiInputData = array_merge($apiInputData, (array)prepareRailGeo($db, $geomfield, $relcislo, $station_ids, $is_reversed)->rail_definition);

echo json_encode($apiInputData);
?>
