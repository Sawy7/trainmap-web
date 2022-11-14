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

$relcisla_str = implode(",", $relcisla);

include "base.php";

// Check DB Connection
if (!$conn) {
    echo '{ "type": "FeatureCollection", "features": null, "properties": null, "status": "dboff" }';
    exit;
}

// Build SQL SELECT statement and return the geometry as a GeoJSON element in EPSG: 4326
$sql = "SELECT ST_AsGeoJSON(ST_Multi(ST_LineMerge(ST_Collect(" . $geomfield . ")))) AS geojson, osm_data_index.*
FROM osm_rails JOIN osm_data_index ON osm_rails.relcislo = osm_data_index.relcislo
WHERE osm_data_index.relcislo IN (" . pg_escape_string($conn, $relcisla_str) . ")
GROUP BY osm_data_index.relcislo";
// echo $sql;

// Try query or error
$rs = @pg_query($conn, $sql);
if (!$rs) {
    echo '{ "type": "FeatureCollection", "features": null, "properties": null, "status": "sqlerror" }';
    exit;
}

// Build GeoJSON
$output    = '';
$rowOutput = '';

while ($row = pg_fetch_assoc($rs)) {
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