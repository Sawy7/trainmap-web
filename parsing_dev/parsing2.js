var shp = require('shpjs');
 
shp("/tmp/3d.zip").then(function(geojson){
    //see bellow for whats here this internally call shp.parseZip()
});