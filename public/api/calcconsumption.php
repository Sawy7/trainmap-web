<?php
/**
 * PostGIS to GeoJSON
 * Link to original: https://gist.github.com/bmcbride/1913855
 * Modified by Sawy7
 * Query a PostGIS table or view and return the results in GeoJSON format, suitable for use in OpenLayers, Leaflet, etc.
 * 
 * @param 		string		$relcislo	The OSM relation id *REQUIRED*
 * @return 		string					resulting geojson string
 */

header("Access-Control-Allow-Origin: *"); // NOTE: This can be configured in Apache
header("Content-Type: application/json");

// Retrive JSON variables
$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['relcislo'])) {
    echo '{"type": "MissingParameter", "name": "relcislo"}';
    exit;
} else
    $relcislo = $data['relcislo'];

require "apibase.php";

// Build SQL SELECT statement and return the geometry as a GeoJSON element in EPSG: 4326
$sql = "SELECT * FROM calc_consumption(?);";
// echo $sql;

// Try query or error
$rs = $db->prepare($sql);
$rs->execute([$relcislo]);
if (!$rs) {
    echo '{ "type": "Consumption", "Data": null, "status": "sqlerror" }';
    exit;
}

// Build GeoJSON
$velocityOut = '';
$maxVelocityOut = '';
$forceOut = '';
$distanceOut = '';
$exertedEnergyOut = '';

$firstValue = true;

while ($row = $rs->fetch()) {
    if (!$firstValue) {
        $velocityOut .= ',';
        $maxVelocityOut .= ',';
        $forceOut .= ',';
        $distanceOut .= ',';
        $exertedEnergyOut .= ',';
    }
    $velocityOut .= $row["velocity"];
    $maxVelocityOut .= $row["max_velocity"];
    $forceOut .= $row["force"];
    $distanceOut .= $row["distance"];
    $exertedEnergyOut .= $row["exerted_energy"];
    $firstValue = false;
}

if ($firstValue) {
    echo '{ "type": "Consumption", "Data": null, "status": "nodata" }';
} else {
    echo '{"type": "Consumption", "Data": {
"velocity": [ ' . $velocityOut . ' ],
"max_velocity": [ ' . $maxVelocityOut . ' ],
"force": [ ' . $forceOut . ' ],
"distance": [ ' . $distanceOut . ' ],
"exerted_energy": [ ' . $exertedEnergyOut . ' ]},
"status": "ok" }';
}
?>