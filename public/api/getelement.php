<?php
/**
 * PostGIS to GeoJSON
 * Link to original: https://gist.github.com/bmcbride/1913855
 * Modified by Sawy7
 * Query a PostGIS table or view and return the results in GeoJSON format, suitable for use in OpenLayers, Leaflet, etc.
 * 
 * @param 		string		$id		    The PostGIS entity id *REQUIRED*
 * @return 		string					resulting geojson string
 */

header("Access-Control-Allow-Origin: *"); // NOTE: This can be configured in Apache
header("Content-Type: application/json");
 
// Retrive URL variables
if (empty($_GET['id'])) {
    echo '{"type": "MissingParameter", "name": "id"}';
    exit;
} else
    $id = $_GET['id'];

include "base.php";

// Check DB Connection
if (!$conn) {
    echo '{ "type": "Feature", "geometry": null, "properties": null, "status": "dboff" }';
    exit;
}

// Build SQL SELECT statement and return the geometry as a GeoJSON element in EPSG: 4326
$sql = "SELECT map_data_index.*, ST_AsGeoJSON(ST_Simplify(ST_Collect(ST_Transform(" . $geomfield . ", " . $srid . ") ORDER BY gid ASC), 0.000001)) AS geojson
FROM map_routes JOIN map_data_index ON map_data_index.id = map_routes.idtrasy WHERE idtrasy = " . pg_escape_string($conn, $id) .
"GROUP BY map_data_index.id LIMIT 1";
// echo $sql;

// Try query or error
$rs = @pg_query($conn, $sql);
if (!$rs) {
    echo '{ "type": "Feature", "geometry": null, "properties": null, "status": "sqlerror" }';
    exit;
}

// Build GeoJSON
$output    = '';
$rowOutput = '';

while ($row = pg_fetch_assoc($rs)) {
    $rowOutput = (strlen($rowOutput) > 0 ? ',' : '') . '{"type": "Feature", "geometry": ' . $row['geojson'] . ', "properties": {';
    $props = '';
    $props .= createJsonKey("id", $row["id"], true);
    $props .= ', ' . createJsonKey("name", $row["nazevtrasy"]);
    $props .= ', ' . createJsonKey("color", $row["color"]);
    $props .= ', ' . createJsonKey("weight", $row["weight"], true);
    $props .= ', ' . createJsonKey("opacity", $row["opacity"], true);
    $props .= ', ' . createJsonKey("smooth_factor", $row["smooth_factor"], true);
    $props .= ', ' . createJsonKey("lineator", $row["lineator"], true);
    $props .= ', ' . createJsonKey("tags", $row["tags"]);
    $rowOutput .= $props . '}';
    $rowOutput .= ', ' . createJsonKey("status", "ok");
    $rowOutput .= "}";
    $output .= $rowOutput;
}

if (empty($output)) {
    $output = '{ "type": "Feature", "geometry": null, "properties": null, "status": "nodata" }';
}
echo $output;
?>