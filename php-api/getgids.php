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
function escapeJsonString($value) { # list from www.json.org: (\b backspace, \f formfeed)
  $escapers = array("\\", "/", "\"", "\n", "\r", "\t", "\x08", "\x0c");
  $replacements = array("\\\\", "\\/", "\\\"", "\\n", "\\r", "\\t", "\\f", "\\b");
  $result = str_replace($escapers, $replacements, $value);
  return $result;
}
header("Access-Control-Allow-Origin: *"); // NOTE: This can be configured in Apache
header("Content-Type: application/json");
 
# Retrive URL variables
if (empty($_GET['id'])) {
    echo "missing required parameter: <i>id</i>";
    exit;
} else
    $id = $_GET['id'];

$geomfield = "geom";
$srid = "4326"; // WGS-84 (GPS)
$routes_table = "map_routes";
	
# Connect to PostgreSQL database
$conn = pg_connect("dbname='map_data' user='postgres' password='mysecretpassword' host='localhost'");
if (!$conn) {
    echo "Not connected : " . pg_error();
    exit;
}

# Build SQL SELECT statement and return the geometry as a GeoJSON element in EPSG: 4326
$sql = "SELECT gid FROM " . pg_escape_string($conn, $routes_table) . " WHERE idtrasy = " . pg_escape_string($conn, $id) . " ORDER BY gid ASC";
// echo $sql;

# Try query or error
$rs = pg_query($conn, $sql);
if (!$rs) {
    echo "An SQL error occured.\n";
    exit;
}

# Build GeoJSON
$output    = '';
$rowOutput = '';

while ($row = pg_fetch_assoc($rs)) {
    $rowOutput = (strlen($rowOutput) > 0 ? ', ' : '') . $row["gid"];
    $output .= $rowOutput;
}

$output = '{"type": "GidList", "gids":  [ ' . $output . ' ] }';
echo $output;
?>