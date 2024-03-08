<?php
function getStationOrders($db, $relcislo, $station_ids) {
    // Get station_orders
    $sql = "SELECT even_station_relation.station_order
    FROM even_station_relation JOIN
    all_stations ON even_station_relation.station_id = all_stations.id
    WHERE relcislo = ? AND station_id =ANY (?)
    ORDER BY even_station_relation.relcislo, station_order";

    // Try query or error
    $stations_pg_array = "{".implode(', ',$station_ids)."}";
    $sql_params = [$relcislo, $stations_pg_array];
    $rs = $db->prepare($sql);
    $rs->execute($sql_params);
    if (!$rs) {
        echo '{ "type": "Consumption", "Data": null, "status": "sqlerror" }';
        http_response_code(500);
        exit;
    }

    $station_orders = [];

    while ($row = $rs->fetch()) {
        array_push($station_orders, $row["station_order"]);
    }

    return $station_orders;
}

function getLinestring($db, $geomfield, $relcislo, $is_reversed) {
    $sql = "SELECT ST_AsGeoJSON(";
    if ($is_reversed)
        $sql .= "ST_Reverse($geomfield)";
    else
        $sql .= $geomfield;
    $sql .= ") AS geojson FROM even_processed_routes_line_dmr WHERE relcislo = ?";

    // Try query or error
    $rs = $db->prepare($sql);
    $rs->execute([$relcislo]);
    if (!$rs) {
        echo '{ "type": "Consumption", "Data": null, "status": "sqlerror" }';
        http_response_code(500);
        exit;
    }

    $row = $rs->fetch();
    return json_decode($row["geojson"])->coordinates;
}

function getVelocityWays($db, $relcislo) {
    $sql = "SELECT start_order, end_order, maxspeed
    FROM get_even_route_line_ways(?) AS ewr JOIN
    osm_ways ON ewr.way_id = osm_ways.id";

    // Try query or error
    $rs = $db->prepare($sql);
    $rs->execute([$relcislo]);
    if (!$rs) {
        echo '{ "type": "Consumption", "Data": null, "status": "sqlerror" }';
        http_response_code(500);
        exit;
    }

    $velocity_ways = [];

    while ($row = $rs->fetch()) {
        array_push($velocity_ways, ["start" => $row["start_order"], "end" => $row["end_order"], "velocity" => $row["maxspeed"]]);
    }

    return $velocity_ways;
}

function legacyGoRemap($array) {
    $mapping = array(
        // Input: legacy -> go
        "mass_locomotive" => "masslocomotive",
        "mass_wagon" => "masswagon",
        "power_limit" => "powerlimit",
        "Comfortable acceleration" => "comfortableaccel",
        "Elevation smoothing" => "elevationsmoothwindow",
        "Recuperation coefficient" => "recuperactioncoef",
        "Running a" => "runninga",
        "Running b" => "runningb",
        "Running c" => "runningc",
        "Compensation polynomial" => "compensationpoly",
        // Output: go -> legacy
        "geojson" => "rail_definition",
        "velocity" => "velocity_values",
        "distance" => "dist_values",
        "acceleration" => "acceleration_values",
        "force" => "force_values",
        "exertedforce" => "exerted_force_values",
        "exertedenergy" => "exerted_energy"
    );

    $result = array();

    foreach ($array as $key => $value) {
        if (isset($mapping[$key])) {
            $result[$mapping[$key]] = $value;
        } else {
            $result[$key] = $value;
        }
    }

    return $result;
}

function prepareRailGeo($db, $geomfield, $relcislo, $station_ids, $is_reversed) {
    // Prepare data store
    $apiInputData = new stdClass();
    $apiInputData->rail_definition = new stdClass();

    // Get station_orders
    $apiInputData->rail_definition->station_orders = getStationOrders($db, $relcislo, $station_ids);

    // Get linestring
    $apiInputData->rail_definition->coordinates = getLinestring($db, $geomfield, $relcislo, $is_reversed);

    // Get velocity_ways
    $apiInputData->rail_definition->velocity_ways = getVelocityWays($db, $relcislo);

    // Reverse
    $pointCount = count($apiInputData->rail_definition->coordinates);
    if ($is_reversed) {
        // Station orders
        foreach($apiInputData->rail_definition->station_orders as &$so) {
            $so = $pointCount-1-$so;
        }
        $apiInputData->rail_definition->station_orders = array_reverse($apiInputData->rail_definition->station_orders);

        // Velocity ways
        foreach($apiInputData->rail_definition->velocity_ways as &$vw) {
            $old_start = $vw["start"];
            $vw["start"] = $pointCount-1-$vw["end"];
            $vw["end"] = $pointCount-1-$old_start;
        }
        $apiInputData->rail_definition->velocity_ways = array_reverse($apiInputData->rail_definition->velocity_ways);
    }

    return $apiInputData;
}

function prepareRailGeoGo($db, $geomfield, $relcislo, $station_ids, $is_reversed) {
    // Prepare data store
    $apiInputData = new stdClass();
    $apiInputData->geojson = new stdClass();
    $apiInputData->geojson->type = "LineString";

    // Get station_orders
    $apiInputData->geojson->station_orders = getStationOrders($db, $relcislo, $station_ids);

    // Get linestring
    $apiInputData->geojson->coordinates = getLinestring($db, $geomfield, $relcislo, $is_reversed);

    // Get velocity_ways
    $apiInputData->geojson->velocity_ways = getVelocityWays($db, $relcislo);

    // Reverse
    $pointCount = count($apiInputData->geojson->coordinates);
    if ($is_reversed) {
        // Station orders
        foreach($apiInputData->geojson->station_orders as &$so) {
            $so = $pointCount-1-$so;
        }
        $apiInputData->geojson->station_orders = array_reverse($apiInputData->geojson->station_orders);

        // Velocity ways
        foreach($apiInputData->geojson->velocity_ways as &$vw) {
            $old_start = $vw["start"];
            $vw["start"] = $pointCount-1-$vw["end"];
            $vw["end"] = $pointCount-1-$old_start;
        }
        $apiInputData->geojson->velocity_ways = array_reverse($apiInputData->geojson->velocity_ways);
    }

    return $apiInputData;
}
?>
