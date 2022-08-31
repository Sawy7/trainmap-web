<?php
/**
 * Link to original: https://gist.github.com/bmcbride/1913855
 * Modified by Sawy7
 * 
 * @return 		string					resulting json string
 */
header("Access-Control-Allow-Origin: *"); // NOTE: This can be configured in Apache
header("Content-Type: application/json");
 
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