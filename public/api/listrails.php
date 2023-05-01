<?php
/**
 * PostGIS to GeoJSON
 * Link to original: https://gist.github.com/bmcbride/1913855
 * Modified by Sawy7
 * Query a PostGIS table or view and return the results in GeoJSON format, suitable for use in OpenLayers, Leaflet, etc.
 * 
 * @return 		string					resulting array
 */

header("Access-Control-Allow-Origin: *"); // NOTE: This can be configured in Apache
header("Content-Type: application/json");

require "apibase.php";

// Build SQL SELECT statement and return the geometry as a GeoJSON element in EPSG: 4326
$sql = "SELECT DISTINCT osm_data_index.relcislo, osm_data_index.id,
osm_data_index.nazevtrasy as name, osm_data_index.tags
FROM processed_routes_line
JOIN osm_data_index ON processed_routes_line.relcislo = osm_data_index.relcislo
ORDER BY relcislo";
// echo $sql;

// Build railList JSON from DB query
echo buildRailListJSON($db, $sql);
?>