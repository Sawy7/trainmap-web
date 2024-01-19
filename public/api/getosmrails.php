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
    http_response_code(400);
    exit;
} else
    $relcisla = $data['relcisla'];

require "apibase.php";

// Build SQL SELECT statement and return the geometry as a GeoJSON element in EPSG: 4326
$placeholders = rtrim(str_repeat('?, ', count($relcisla)), ', ') ;
$sql = "SELECT ST_AsGeoJSON(ST_Multi(ST_LineMerge(ST_Collect($geomfield)))) AS geojson, osm_data_index.relcislo, id, nazevtrasy as name
FROM osm_rails JOIN osm_data_index ON osm_rails.relcislo = osm_data_index.relcislo
WHERE osm_data_index.relcislo IN ($placeholders)
GROUP BY osm_data_index.relcislo
ORDER BY osm_data_index.relcislo";
// echo $sql;

// Build geoJSON from DB query
echo buildGeoJSON($db, $sql, $relcisla);
?>
