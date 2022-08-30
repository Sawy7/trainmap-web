<?php
/**
 * Created by Sawy7
 * 
 * @return 		string					resulting json string
 */
function escapeJsonString($value) { # list from www.json.org: (\b backspace, \f formfeed)
  $escapers = array("\\", "/", "\"", "\n", "\r", "\t", "\x08", "\x0c");
  $replacements = array("\\\\", "\\/", "\\\"", "\\n", "\\r", "\\t", "\\f", "\\b");
  $result = str_replace($escapers, $replacements, $value);
  return $result;
}
header("Access-Control-Allow-Origin: *"); // NOTE: This can be configured in Apache
 
# Connect to PostgreSQL database
$conn = pg_connect("dbname='nyc' user='postgres' password='mysecretpassword' host='localhost'");
if (!$conn) {
    echo "Not connected : " . pg_error();
    exit;
}

# Build SQL SELECT statement and return the geometry as a GeoJSON element in EPSG: 4326
$sql = "SELECT * FROM pg_catalog.pg_tables
        WHERE schemaname != 'pg_catalog' AND 
              schemaname != 'information_schema' AND
	          tablename != 'spatial_ref_sys'";
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
    $rowOutput = (strlen($rowOutput) > 0 ? ', ' : '') . '"' . $row['tablename'] . '"';   
    $output .= $rowOutput;
}

$output = '{ "type": "LayerList", "names": [ ' . $output . ' ] }';
echo $output;
?>