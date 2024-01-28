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
// $sql = "SELECT ST_AsGeoJSON(ST_SimplifyVW(ST_Transform(" . $geomfield . ", " . $srid . "), 0.0000001)) AS geojson, osm_data_index.*
// FROM processed_routes_line JOIN osm_data_index ON processed_routes_line.relcislo = osm_data_index.relcislo
// WHERE osm_data_index.relcislo IN (" . pg_escape_string($conn, $relcisla_str) . ")";

// TODO: Simplify doesn't really work with station indexes (disabled for now)
$placeholders = rtrim(str_repeat('?, ', count($relcisla)), ', ') ;
$sql = "SELECT ST_AsGeoJSON(ST_Transform(prls.$geomfield, $srid)) AS geojson,
odi.relcislo, id, nazevtrasy as name
FROM processed_routes_line AS prl
JOIN osm_data_index AS odi ON prl.relcislo = odi.relcislo
JOIN processed_routes_line_dmr AS prls ON prl.relcislo = prls.relcislo 
WHERE odi.relcislo IN ($placeholders)
ORDER BY odi.relcislo";
// echo $sql;

// Build geoJSON from DB query
echo buildGeoJSON($db, $sql, $relcisla);
?>
