#!/bin/sh

# SELECT ST_AsGeoJSON(ST_Transform( geom, 4326 )) FROM olc_krn_ova_z;

shp2pgsql \
  -I \
  -s 5514 \
  Olc_Krn_Ova_Z.shp \
  Olc_Krn_Ova_Z \
  > output.sql
