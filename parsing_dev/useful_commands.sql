-- Database: map_data

-- DROP DATABASE IF EXISTS map_data;

CREATE DATABASE map_data
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;


-- Run this separately
CREATE EXTENSION postgis;
SELECT postgis_full_version();

SELECT ST_AsGeoJSON(ST_Transform( geom, 4326 )) FROM olc_krn_ova_z;
SELECT ST_AsText(ST_Collect(x ORDER BY ST_YMin(x) DESC)) FROM (SELECT ST_LineMerge(geom) AS x FROM olc_krn_ova_z) AS foo;
