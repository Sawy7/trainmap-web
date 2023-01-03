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
    echo '{ "type": "Stations", "Collections": null, "status": "dboff" }';
    exit;
}

// Build SQL SELECT statement and return the geometry as a GeoJSON element in EPSG: 4326
$sql = "SELECT all_stations.name AS name,
ST_AsGeoJSON(ST_ClosestPoint(ST_Transform(processed_routes_line.geom," . $srid . "), all_stations.geom)) AS " . $geomfield . ",
processed_routes_line.relcislo AS relcislo,
all_stations.id AS stationid
FROM processed_routes_line, all_stations
WHERE processed_routes_line.relcislo IN (" . pg_escape_string($conn, $relcisla_str) . ") AND
ST_DWithin(ST_Transform(ST_Force2D(processed_routes_line.geom)," . $srid . "), all_stations." . $geomfield . ", 0.001)
ORDER BY processed_routes_line.relcislo,
ST_Distance(all_stations.geom, ST_StartPoint(ST_Transform(processed_routes_line.geom,4326)))";
// echo $sql;

// Try query or error
$rs = @pg_query($conn, $sql);
if (!$rs) {
    echo '{ "type": "Stations", "Collections": null, "status": "sqlerror" }';
    exit;
}

// Build GeoJSON
$output    = '';
$rowOutput = '';
$relOutput = '';
$prevRelcislo = NULL;

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
    $props .= ', ' . createJsonKey("id", $row["stationid"], true);
    $rowOutput .= $props . '}';
    $rowOutput .= "}";
    $relOutput .= $rowOutput;
}
$output .= '{"type": "FeatureCollection", "features": [ ' . $relOutput . ' ], "properties": {"relcislo": ' . $prevRelcislo . '}}';

if (empty($output)) {
    $output = '{ "type": "Stations", "Collections": null, "status": "nodata" }';
} else {
    $output = '{"type": "Stations", "Collections": [ ' . $output . ' ], "status": "ok" }';
}
echo $output;
?>