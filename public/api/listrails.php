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
$sql = "SELECT odi.relcislo, odi.id,
odi.nazevtrasy as name,
prt.tags
FROM processed_routes_line AS prl
LEFT JOIN (
	SELECT relcislo, json_agg(json_build_object('tag_name', tag_name, 'tag_values', tag_values)) AS tags FROM (
		SELECT relcislo, tag_name, jsonb_object_agg(COALESCE(tag_value, 'none'), tag_portion) AS tag_values
		FROM processed_routes_tags
		GROUP BY relcislo, tag_name
	) AS tags_grouped
	GROUP BY relcislo
) AS prt USING (relcislo)
JOIN osm_data_index AS odi ON prl.relcislo = odi.relcislo
ORDER BY relcislo";
// echo $sql;

// Build railList JSON from DB query
echo buildRailListJSON($db, $sql);
?>