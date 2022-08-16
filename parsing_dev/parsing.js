var shapefile = require("shapefile");
const proj4 = require("proj4");

// Sauce:
// http://lepsi-nez-zivot.blogspot.com/2017/08/konverze-s-jtsk-krovak-do-wsg84-gsm-api.html
// https://github.com/proj4js/proj4js

proj4.defs("EPSG:4326","+proj=longlat +datum=WGS84 +no_defs");
proj4.defs("EPSG:5514","+proj=krovak +lat_0=49.5 +lon_0=24.83333333333333 +alpha=30.28813972222222 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +towgs84=589,76,480,0,0,0,0 +units=m +no_defs");

let points = []

function ListPoints() {
    points.forEach(element => {
        console.log(element);
    });
}

shapefile.open("Olc_Krn_Ova.shp")
.then(source => source.read()
    .then(function log(result) {
        if (result.done) {
            ListPoints();
            return;
        }

        // Parse coords to GPS (WSG84)
        result.value["geometry"]["coordinates"].forEach(coord => {
            gpsPoint = proj4("EPSG:5514","EPSG:4326",coord);
            points.push([gpsPoint[1], gpsPoint[0]]);
        });

        // console.log(result.value["geometry"]["coordinates"]);
        return source.read().then(log);
}))
.catch(error => console.error(error.stack));

