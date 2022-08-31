#!/bin/sh

shp2pgsql \
  -I \
  -s 5514 \
  -S \
  Olc_Krn_Ova_Z.shp \
  Olc_Krn_Ova_Z \
  > output.sql
