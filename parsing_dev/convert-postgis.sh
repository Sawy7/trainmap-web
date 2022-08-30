#!/bin/sh

# SELECT ST_AsGeoJSON(ST_Transform( geom, 4326 )) FROM olc_krn_ova_z;
# SELECT ST_AsText(ST_Collect(x ORDER BY ST_YMin(x) DESC)) FROM (SELECT ST_LineMerge(geom) AS x FROM olc_krn_ova_z) AS foo;

shp2pgsql \
  -I \
  -s 5514 \
  -S \
  Olc_Krn_Ova_Z.shp \
  Olc_Krn_Ova_Z \
  > output.sql
