<?php
function prepareRailGeo($db, $geomfield, $relcislo, $station_ids, $is_reversed) {
    // Get station_orders
    $placeholders = rtrim(str_repeat('?, ', count($station_ids)), ', ') ;
    $sql = "SELECT all_stations.name AS name, ST_AsGeoJSON(even_station_relation.$geomfield) AS geom,
    even_station_relation.relcislo AS relcislo, all_stations.id as station_id, even_station_relation.station_order
    FROM even_station_relation JOIN
    all_stations ON even_station_relation.station_id = all_stations.id
    WHERE relcislo = ? AND station_id IN ($placeholders)
    ORDER BY even_station_relation.relcislo, station_order";

    // Try query or error
    $sql_params = array_merge([$relcislo], $station_ids);
    $rs = $db->prepare($sql);
    $rs->execute($sql_params);
    if (!$rs) {
        echo '{ "type": "Consumption", "Data": null, "status": "sqlerror" }';
        http_response_code(500);
        exit;
    }

    $apiInputData = new stdClass();
    $apiInputData->rail_definition = new stdClass();
    $apiInputData->rail_definition->station_orders = [];

    while ($row = $rs->fetch()) {
        array_push($apiInputData->rail_definition->station_orders, $row["station_order"]);
    }

    // Get linestring
    $sql = "SELECT ST_AsGeoJSON(ST_Collect($geomfield)) AS geojson FROM (
    SELECT (ST_DumpPoints(geom)).geom FROM even_processed_routes_line_dmr
    WHERE relcislo = ?
    ORDER BY (ST_DumpPoints(geom)).path[1]";

    if ($is_reversed)
        $sql .= " DESC";

    $sql .= ") AS all_points;";

    // Try query or error
    $rs = $db->prepare($sql);
    $rs->execute([$relcislo]);
    if (!$rs) {
        echo '{ "type": "Consumption", "Data": null, "status": "sqlerror" }';
        http_response_code(500);
        exit;
    }

    while ($row = $rs->fetch()) {
        $apiInputData->rail_definition->coordinates = json_decode($row["geojson"])->coordinates;
    }

    $pointCount = count($apiInputData->rail_definition->coordinates);
    if ($is_reversed) {
        foreach($apiInputData->rail_definition->station_orders as &$so) {
            $so = $pointCount-1-$so;
        }
        $apiInputData->rail_definition->station_orders = array_reverse($apiInputData->rail_definition->station_orders);
    }

    // Get velocity_ways
    $sql = "SELECT start_order, end_order, maxspeed
    FROM get_even_route_line_ways(?) AS ewr JOIN
    osm_ways ON ewr.way_id = osm_ways.id
    WHERE relcislo = ?";

    // Try query or error
    $rs = $db->prepare($sql);
    $rs->execute([$relcislo, $relcislo]);
    if (!$rs) {
        echo '{ "type": "Consumption", "Data": null, "status": "sqlerror" }';
        http_response_code(500);
        exit;
    }

    $apiInputData->rail_definition->velocity_ways = [];

    while ($row = $rs->fetch()) {
        array_push($apiInputData->rail_definition->velocity_ways, ["start" => $row["start_order"], "end" => $row["end_order"], "velocity" => $row["maxspeed"]]);
    }

    if ($is_reversed) {
        foreach($apiInputData->rail_definition->velocity_ways as &$vw) {
            $old_start = $vw["start"];
            $vw["start"] = $pointCount-1-$vw["end"];
            $vw["end"] = $pointCount-1-$old_start;
        }
        $apiInputData->rail_definition->velocity_ways = array_reverse($apiInputData->rail_definition->velocity_ways);
    }

    return $apiInputData;
}
?>
