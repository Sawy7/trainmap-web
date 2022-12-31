<?php
/**
 * PostGIS to GeoJSON
 * Link to original: https://gist.github.com/bmcbride/1913855
 * Modified by Sawy7
 * Query a PostGIS table or view and return the results in GeoJSON format, suitable for use in OpenLayers, Leaflet, etc.
 * 
 * @param 		string		$relcisla	The OSM relation id *REQUIRED*
 * @return 		string					resulting geojson string
 */

header("Access-Control-Allow-Origin: *"); // NOTE: This can be configured in Apache
header("Content-Type: application/json");

// Retrive JSON variables
$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['relcisla'])) {
    echo '{"type": "MissingParameter", "name": "relcisla"}';
    exit;
} else
    $relcisla = $data['relcisla'];

$relcisla_str = implode(",", $relcisla);

include "base.php";

// Check DB Connection
if (!$conn) {
    echo '{ "type": "FeatureCollection", "features": null, "properties": null, "status": "dboff" }';
    exit;
}

// Build SQL SELECT statement and return the geometry as a GeoJSON element in EPSG: 4326
$sql = "SELECT all_stations.name AS name, ST_AsGeoJSON(
ST_ClosestPoint(ST_Transform((SELECT " . $geomfield . " FROM processed_routes_line WHERE relcislo = station_relation.relcislo)," . $srid . "), all_stations." . $geomfield . ")
) AS " . $geomfield . ", station_relation.relcislo AS relcislo
FROM all_stations
JOIN station_relation ON all_stations.id = station_relation.station_id
WHERE station_relation.relcislo IN (" . pg_escape_string($conn, $relcisla_str) . ")
ORDER BY station_relation.relcislo";
// echo $sql;

// Try query or error
$rs = @pg_query($conn, $sql);
if (!$rs) {
    echo '{ "type": "FeatureCollection", "features": null, "properties": null, "status": "sqlerror" }';
    exit;
}

// Build GeoJSON
$output    = '';
$rowOutput = '';
$relOutput = '';
$prevRelcislo = NULL;

// TODO: Categorize by relcislo (into JSON groups)
while ($row = pg_fetch_assoc($rs)) {
    if ($prevRelcislo != NULL && $prevRelcislo != $row["relcislo"]) {
        $output .= '{"type": "FeatureCollection", "features": [ ' . $relOutput . ' ], "properties": {"relcislo": ' . $prevRelcislo . '}},';
        $relOutput = '';
        $rowOutput = '';
    }
    $prevRelcislo = $row["relcislo"];
    $rowOutput = (strlen($rowOutput) > 0 ? ',' : '') . '{"type": "Feature", "geometry": ' . $row[$geomfield] . ', "properties": {';
    $props = '';
    $props .= createJsonKey("name", $row["name"]);
    // $props .= ', ' . createJsonKey("relcislo", $row["relcislo"], true);
    $rowOutput .= $props . '}';
    $rowOutput .= "}";
    $relOutput .= $rowOutput;
}
$output .= '{"type": "FeatureCollection", "features": [ ' . $relOutput . ' ], "properties": {"relcislo": ' . $prevRelcislo . '}}';

if (empty($output)) {
    $output = '{ "type": "FeatureCollection", "features": null, "status": "nodata" }';
} else {
    $output = '{"type": "Stations", "Collections": [ ' . $output . ' ], "status": "ok" }';
}
echo $output;
?>