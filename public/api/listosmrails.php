<?php
/**
 * PostGIS to GeoJSON
 * Link to original: https://gist.github.com/bmcbride/1913855
 * Modified by Sawy7
 * Query a PostGIS table or view and return the results in GeoJSON format, suitable for use in OpenLayers, Leaflet, etc.
 * 
 * @return 		string					resulting array
 */

header("Access-Control-Allow-Origin: *"); // NOTE: This can be configured in Apache
header("Content-Type: application/json");

include "base.php";

// Check DB Connection
if (!$conn) {
    echo '{"type": "RailList", "railnums": [ ], "status": "dboff" }';
    exit;
}

// Build SQL SELECT statement and return the geometry as a GeoJSON element in EPSG: 4326
$sql = "SELECT *
FROM osm_data_index
WHERE relcislo NOT IN
(
	SELECT relcislo FROM processed_routes WHERE relcislo IS NOT NULL
)";
// echo $sql;

// Try query or error
$rs = @pg_query($conn, $sql);
if (!$rs) {
    echo '{"type": "RailList", "layers": [ ], "status": "sqlerror" }';
    exit;
}

// Build GeoJSON
$output    = '';
$rowOutput = '';

while ($row = pg_fetch_assoc($rs)) {
    $rowOutput = (strlen($rowOutput) > 0 ? ', ' : '') . '{';
    $rowOutput .= createJsonKey("relcislo", $row["relcislo"], true);
    $rowOutput .= ', ' . createJsonKey("id", $row["id"]);
    $rowOutput .= ', ' . createJsonKey("name", $row["nazevtrasy"]);
    $rowOutput .= ', ' . createJsonKey("color", $row["color"]);
    $rowOutput .= ', ' . createJsonKey("weight", $row["weight"], true);
    $rowOutput .= ', ' . createJsonKey("opacity", $row["opacity"], true);
    $rowOutput .= ', ' . createJsonKey("smooth_factor", $row["smooth_factor"], true);
    $rowOutput .= ', ' . createJsonKey("tags", $row["tags"]);
    $rowOutput .= '}';
    $output .= $rowOutput;
}

if (empty($output)) {
    echo '{"type": "RailList", "layers": [ ], "status": "nodata" }';
} else {
    $output = '{"type": "RailList", "layers": [ ' . $output . ' ], "status": "ok" }';
    echo $output;
}
?>