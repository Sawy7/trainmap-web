<?php
/**
 * Link to original: https://gist.github.com/bmcbride/1913855
 * Modified by Sawy7
 * 
 * @param 		string		$id		    The PostGIS entity id *REQUIRED*
 * @return 		string					resulting json string
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
    echo '{ "type": "LineatorList", "min_gid": null, "hierarchy": [ ], "status": "dboff" }';
    exit;
}

// Build SQL SELECT statement and return the geometry as a GeoJSON element in EPSG: 4326
$sql = "SELECT parent_gid, child_gid, point_index, connect_index FROM map_lineators WHERE idtrasy = " . pg_escape_string($conn, $id) . " ORDER BY id";// . " AND parent_gid";

// Try query or error
$rs = @pg_query($conn, $sql);
if (!$rs) {
    echo '{ "type": "LineatorList", "min_gid": null, "hierarchy": [ ], "status": "sqlerror" }';
    exit;
}

// Build GeoJSON
$output    = '';
$rowOutput = '';

while ($row = pg_fetch_assoc($rs)) {
    $rowOutput = (strlen($rowOutput) > 0 ? ', ' : '') . '{';
    $rowOutput .= createJsonKey("parent", $row["parent_gid"], true);
    $rowOutput .= ', ' . createJsonKey("child", $row["child_gid"], true);
    $rowOutput .= ', ' . createJsonKey("point_index", $row["point_index"], true);
    $rowOutput .= ', ' . createJsonKey("connect_index", $row["connect_index"], true);
    $rowOutput .= '}';
    $output .= $rowOutput;
}

$sql = "SELECT MIN(child_gid) AS min_gid FROM map_lineators WHERE idtrasy = " . pg_escape_string($conn, $id);
// echo $sql;

// Try query or error
$rs = @pg_query($conn, $sql);
if (!$rs) {
    echo '{ "type": "LineatorList", "min_gid": null, "hierarchy": [ ], "status": "sqlerror" }';
    exit;
}

$row = pg_fetch_assoc($rs);

if (empty($output)) {
    echo '{ "type": "LineatorList", "min_gid": null, "hierarchy": [ ], "status": "nodata" }';
} else {
    $output = '{ "type": "LineatorList", "min_gid": ' . (empty($row['min_gid']) ? 'null' : $row['min_gid']) . ', "hierarchy": [ ' . $output . ' ], "status": "ok" }';
    echo $output;
}
?>