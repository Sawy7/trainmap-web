<?php
/**
 * Link to original: https://gist.github.com/bmcbride/1913855
 * Modified by Sawy7
 * 
 * @return 		string					resulting json string
 */
function createJsonKey($name, $value, $isNumber=false) {
    $result = '"' . $name . '": ';

    if (is_null($value))
    {
        $value = "null";
        $isNumber = true;
    } else if ($value == "f") {
        $value = "false";
        $isNumber = true;
    } else if ($value == "t") {
        $value = "true";
        $isNumber = true;
    }

    if ($isNumber) {
        $result .= $value;
    } else {
        $result .= '"' . $value . '"';
    }
    return $result;
}
header("Access-Control-Allow-Origin: *"); // NOTE: This can be configured in Apache
header("Content-Type: application/json");
 
# Connect to PostgreSQL database
$conn = pg_connect("dbname='map_data' user='postgres' password='mysecretpassword' host='localhost'");
if (!$conn) {
    echo "Not connected : " . pg_error();
    exit;
}

# Build SQL SELECT statement and return the geometry as a GeoJSON element in EPSG: 4326
$sql = "SELECT * FROM map_data_index";
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

$output = '{ "type": "LayerList", "layers": [ ' . $output . ' ] }';
echo $output;
?>