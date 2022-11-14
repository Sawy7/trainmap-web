<?php
/**
 * Link to original: https://gist.github.com/bmcbride/1913855
 * Modified by Sawy7
 * 
 * @return 		string					resulting json string
 */

header("Access-Control-Allow-Origin: *"); // NOTE: This can be configured in Apache
header("Content-Type: application/json");

include "base.php";
 
// Check DB Connection
if (!$conn) {
    echo '{ "type": "LayerList", "layers": [ ], "status": "dboff" }';
    exit;
}

# Build SQL SELECT statement and return the geometry as a GeoJSON element in EPSG: 4326
$sql = "SELECT * FROM map_data_index ORDER BY id";
// echo $sql;

# Try query or error
$rs = @pg_query($conn, $sql);
if (!$rs) {
    echo '{ "type": "LayerList", "layers": [ ], "status": "sqlerror" }';
    exit;
}

# Build GeoJSON
$output    = '';
$rowOutput = '';

while ($row = pg_fetch_assoc($rs)) {
    $rowOutput = (strlen($rowOutput) > 0 ? ', ' : '') . '{';
    $rowOutput .= createJsonKey("id", $row["id"], true);
    $rowOutput .= ', ' . createJsonKey("name", $row["nazevtrasy"]);
    $rowOutput .= ', ' . createJsonKey("color", $row["color"]);
    $rowOutput .= ', ' . createJsonKey("weight", $row["weight"], true);
    $rowOutput .= ', ' . createJsonKey("opacity", $row["opacity"], true);
    $rowOutput .= ', ' . createJsonKey("smooth_factor", $row["smooth_factor"], true);
    $rowOutput .= ', ' . createJsonKey("lineator", $row["lineator"], true);
    $rowOutput .= ', ' . createJsonKey("tags", $row["tags"]);
    $rowOutput .= '}';
    $output .= $rowOutput;
}

if (empty($output)) {
    echo '{ "type": "LayerList", "layers": [ ], "status": "nodata" }';
} else {
    $output = '{ "type": "LayerList", "layers": [ ' . $output . ' ], "status": "ok"  }';
    echo $output;
}
?>