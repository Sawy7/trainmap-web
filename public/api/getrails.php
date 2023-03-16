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
// $sql = "SELECT ST_AsGeoJSON(ST_SimplifyVW(ST_Transform(" . $geomfield . ", " . $srid . "), 0.0000001)) AS geojson, osm_data_index.*
// FROM processed_routes_line JOIN osm_data_index ON processed_routes_line.relcislo = osm_data_index.relcislo
// WHERE osm_data_index.relcislo IN (" . pg_escape_string($conn, $relcisla_str) . ")";

// TODO: Simplify doesn't really work with station indexes (disabled for now)
$placeholders = rtrim(str_repeat('?, ', count($relcisla)), ', ') ;
$sql = "SELECT ST_AsGeoJSON(ST_Transform($geomfield, $srid)) AS geojson, osm_data_index.*
FROM processed_routes_line JOIN osm_data_index ON processed_routes_line.relcislo = osm_data_index.relcislo
WHERE osm_data_index.relcislo IN ($placeholders)";
// echo $sql;

// Try query or error
$rs = $db->prepare($sql);
$rs->execute($relcisla);
if (!$rs) {
    echo '{ "type": "FeatureCollection", "features": null, "properties": null, "status": "sqlerror" }';
    exit;
}

// Build GeoJSON
$output    = '';
$rowOutput = '';

while ($row = $rs->fetch()) {
    $rowOutput = (strlen($rowOutput) > 0 ? ',' : '') . '{"type": "Feature", "geometry": ' . $row['geojson'] . ', "properties": {';
    $props = '';
    $props .= createJsonKey("relcislo", $row["relcislo"], true);
    $props .= ', ' . createJsonKey("id", $row["id"]);
    $props .= ', ' . createJsonKey("name", $row["nazevtrasy"]);
    $props .= ', ' . createJsonKey("color", $row["color"]);
    $props .= ', ' . createJsonKey("weight", $row["weight"], true);
    $props .= ', ' . createJsonKey("opacity", $row["opacity"], true);
    $props .= ', ' . createJsonKey("smooth_factor", $row["smooth_factor"], true);
    $props .= ', ' . createJsonKey("tags", $row["tags"]);
    $rowOutput .= $props . '}';
    $rowOutput .= ', ' . createJsonKey("status", "ok");
    $rowOutput .= "}";
    $output .= $rowOutput;
}

if (empty($output)) {
    $output = '{ "type": "FeatureCollection", "features": null, "status": "nodata" }';
} else {
    $output = '{"type": "FeatureCollection", "features": [ ' . $output . ' ], "status": "ok" }';
}
echo $output;
?>