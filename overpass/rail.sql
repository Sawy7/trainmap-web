SELECT ST_AsGeoJSON(ST_Collect((ST_Intersection(ST_Transform(map_routes.geom, 4326), osm_rails.geom)))) AS g
FROM map_routes, osm_rails JOIN osm_data_index ON osm_data_index.id = osm_rails.cislo
WHERE ST_Intersects(ST_Transform(map_routes.geom, 4326), osm_rails.geom) AND osm_rails.cislo = 795

SELECT cislo, ST_AsGeoJSON(ST_LineMerge(ST_Collect(geom)))
FROM osm_rails
WHERE osm_rails.cislo = 795
GROUP BY cislo

SELECT ST_AsGeoJSON(ST_Collect(clos)) FROM
(
	SELECT ST_3DClosestPoint(ST_Transform(map_routes.geom, 4326), (ST_DumpPoints(ST_LineMerge(ST_Collect(osm_rails.geom)))).geom) AS clos, (ST_DumpPoints(ST_LineMerge(ST_Collect(osm_rails.geom)))).geom AS osmpoint, ST_Transform(map_routes.geom, 4326) AS szroute
	FROM osm_rails, map_routes
	WHERE osm_rails.cislo = 795
	GROUP BY cislo, map_routes.geom
) AS cp
WHERE ST_DWithin(osmpoint, szroute, 0.00001)

SELECT ST_AsGeoJSON(ST_MakeLine(clos ORDER BY osmorder)) AS line FROM
(
	SELECT
		--(ST_DumpPoints(ST_LineMerge(ST_Collect(osm_rails.geom)))).geom AS osmpoint,
		(ST_DumpPoints(ST_LineMerge(ST_Collect(osm_rails.geom)))).path[1] AS osmorder,
		ST_3DClosestPoint((SELECT ST_Collect(ST_Transform(geom, 4326)) FROM map_routes), (ST_DumpPoints(ST_LineMerge(ST_Collect(osm_rails.geom)))).geom) AS clos
	FROM osm_rails
	WHERE osm_rails.cislo = 795
) AS cp
