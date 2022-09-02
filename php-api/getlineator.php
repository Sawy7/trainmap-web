<?php
/**
 * Link to original: https://gist.github.com/bmcbride/1913855
 * Modified by Sawy7
 * 
 * @param 		string		$id		    The PostGIS entity id *REQUIRED*
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

# Retrive URL variables
if (empty($_GET['id'])) {
    echo "missing required parameter: <i>id</i>";
    exit;
} else
    $id = $_GET['id'];
// if (empty($_GET['parent'])) {
//     echo "missing required parameter: <i>parent</i>";
//     exit;
// } else
//     $parent = $_GET['parent'];
 
# Connect to PostgreSQL database
$conn = pg_connect("dbname='map_data' user='postgres' password='mysecretpassword' host='localhost'");
if (!$conn) {
    echo "Not connected : " . pg_error();
    exit;
}

# Build SQL SELECT statement and return the geometry as a GeoJSON element in EPSG: 4326
$sql = "SELECT parent_gid, child_gid, point_index, connect_index FROM map_lineators WHERE idtrasy = " . pg_escape_string($conn, $id) . " ORDER BY id";// . " AND parent_gid";
// if (strtolower($parent) == "null") {
//     $sql .= " IS ";
// } else {
//     $sql .= " = ";
// }
// $sql .= pg_escape_string($conn, $parent);
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
    $rowOutput .= createJsonKey("parent", $row["parent_gid"], true);
    $rowOutput .= ', ' . createJsonKey("child", $row["child_gid"], true);
    $rowOutput .= ', ' . createJsonKey("point_index", $row["point_index"], true);
    $rowOutput .= ', ' . createJsonKey("connect_index", $row["connect_index"], true);
    $rowOutput .= '}';
    $output .= $rowOutput;
}

$sql = "SELECT MIN(child_gid) AS min_gid FROM map_lineators WHERE idtrasy = " . pg_escape_string($conn, $id);
// echo $sql;

# Try query or error
$rs = pg_query($conn, $sql);
if (!$rs) {
    echo "An SQL error occured.\n";
    exit;
}

$row = pg_fetch_assoc($rs);

$output = '{ "type": "LineatorList", "min_gid": ' . (empty($row['min_gid']) ? 'null' : $row['min_gid']) . ', "hierarchy": [ ' . $output . ' ] }';
echo $output;
?>