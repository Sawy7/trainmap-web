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
$sql = "SELECT relcislo, id, nazevtrasy as name, 'OSM nezpracovaná;' || tags as tags
FROM osm_data_index
WHERE relcislo NOT IN
(
	SELECT relcislo FROM processed_routes_line
)";
// echo $sql;

// Build railList JSON from DB query
echo buildRailListJSON($db, $sql);
?>