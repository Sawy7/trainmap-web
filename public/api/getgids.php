<?php
/**
 * PostGIS to GeoJSON
 * Link to original: https://gist.github.com/bmcbride/1913855
 * Modified by Sawy7
 * Query a PostGIS table or view and return the results in GeoJSON format, suitable for use in OpenLayers, Leaflet, etc.
 * 
 * @param 		string		$id		    The PostGIS entity id *REQUIRED*
 * @return 		string					resulting array
 */

header("Access-Control-Allow-Origin: *"); // NOTE: This can be configured in Apache
header("Content-Type: application/json");

# Retrive URL variables
if (empty($_GET['id'])) {
    echo '{"type": "MissingParameter", "name": "id"}';
    exit;
} else
    $id = $_GET['id'];


include "base.php";
	
// Check DB Connection
if (!$conn) {
    echo '{"type": "GidList", "gids":  [ ], "status": "dboff" }';
    exit;
}

$routes_table = "map_routes";

// Build SQL SELECT statement and return the geometry as a GeoJSON element in EPSG: 4326
$sql = "SELECT gid FROM " . pg_escape_string($conn, $routes_table) . " WHERE idtrasy = " . pg_escape_string($conn, $id) . " ORDER BY gid ASC";
// echo $sql;

// Try query or error
$rs = pg_query($conn, $sql);
if (!$rs) {
    echo '{"type": "GidList", "gids":  [ ], "status": "sqlerror" }';
    exit;
}

// Build GeoJSON
$output    = '';
$rowOutput = '';

while ($row = pg_fetch_assoc($rs)) {
    $rowOutput = (strlen($rowOutput) > 0 ? ', ' : '') . $row["gid"];
    $output .= $rowOutput;
}

if (empty($output)) {
    echo '{"type": "GidList", "gids":  [ ], "status": "nodata" }';
} else {
    $output = '{"type": "GidList", "gids":  [ ' . $output . ' ], "status": "ok" }';
    echo $output;
}
?>