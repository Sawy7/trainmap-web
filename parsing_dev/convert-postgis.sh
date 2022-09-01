#!/bin/sh
###################################################################################
# PARAMETERS:                                                                     #
###################################################################################

if [ "$#" -ne 2 ]; then
    echo "ERROR: Specify shapefile name and route name!"
    exit
fi
shapefileName=$1
routeName=$2
# shapefileName="Olc_Krn_Ova_Z.shp"
routesTable="map_routes"
indexTable="map_data_index"
outputFile="output.sql"
srid="5514"

##################################################################################

shp2pgsql \
  -I \
  -a \
  -s $srid \
  -S \
  $shapefileName \
  $routesTable \
  > $outputFile

sed -i "s/\"$routesTable\" (/\"$routesTable\" (\"idtrasy\",/g" $outputFile
sed -i "s/VALUES (/VALUES (myid,/g" $outputFile

customSQL="CREATE TABLE IF NOT EXISTS \"$indexTable\" (\n\
	id serial PRIMARY KEY,\n\
  	nazevtrasy varchar(200),\n\
	color varchar (50),\n\
	weight int,\n\
	opacity float,\n\
	smooth_factor float,\n\
	lineator_id int UNIQUE,\n\
	tags varchar(200)\n\
);\n\
CREATE TABLE IF NOT EXISTS \"$routesTable\" (\n\
	gid serial PRIMARY KEY,\n\
	idtrasy int,\n\
	id varchar(200),\n\
	popis varchar(200),\n\
	rokzameren varchar(200),\n\
	zkratka varchar(200),\n\
  	geom geometry('LINESTRINGZM', 5514, 4),\n\
	CONSTRAINT fk_idtrasy\n\
		FOREIGN KEY(idtrasy)\n\
			REFERENCES $indexTable(id)\n\
);\n\
INSERT INTO \"$indexTable\" (nazevtrasy,color,weight,opacity,smooth_factor) VALUES ('$routeName','red',5,0.5,1) RETURNING id INTO myid;"

sed -i "s/BEGIN;/BEGIN;\n$customSQL/g" $outputFile

beginning="DO \$\$\n\
DECLARE\n\
	myid int;\n\
BEGIN"
sed -i "s/BEGIN;/$beginning/g" $outputFile

sed -i '$d' $outputFile
sed -i '$d' $outputFile

echo "END \$\$" >> $outputFile
