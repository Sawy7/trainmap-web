// External imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'font-awesome/css/font-awesome.min.css';

import * as L from "leaflet";
import 'leaflet/dist/leaflet.css';
delete L.Icon.Default.prototype['_getIconUrl' as any as keyof L.Icon.Default];
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
    iconUrl: require('leaflet/dist/images/marker-icon.png').default,
    shadowUrl: require('leaflet/dist/images/marker-shadow.png').default
});

// Internal imports
import { App } from "./app";
import { MapLayer } from './maplayer';
import { MapMarker } from "./mapmarker";
import { SingleMapRoad } from "./singleroad";
import { GeoJSONLayer } from './geojsonlayer';
import { ApiComms } from './apicomms';

let app = App.Instance;
app.Init(49.86, 15.51, 15);

// First test layer (BODY)
let myPoints = new MapLayer("Moje body #1");

myPoints.AddMapMarker(new MapMarker(new L.LatLng(49.86, 15.511), "This is a popup #1"));
myPoints.AddMapMarker(new MapMarker(new L.LatLng(49.86, 15.512), "This is a popup #2"));
myPoints.AddMapMarker(new MapMarker(new L.LatLng(49.86, 15.513), "This is a popup #3"));
myPoints.AddMapMarker(new MapMarker(new L.LatLng(49.86, 15.514), "This is a popup #4"));

app.AddMapLayer(myPoints);

// Second test layer (CESTY)
let myRoads = new MapLayer("Moje cesty #1");

myRoads.AddMapRoad(new SingleMapRoad([
    new L.LatLng(49.86, 15.511),
    new L.LatLng(49.861, 15.512),
    new L.LatLng(49.86, 15.513),
    new L.LatLng(49.86, 15.514)
], [
    500,
    100,
    500,
    100
], "blue"));
myRoads.AddMapRoad(new SingleMapRoad([
    new L.LatLng(49.859, 15.511),
    new L.LatLng(49.859, 15.512),
    new L.LatLng(49.858, 15.513),
    new L.LatLng(49.859, 15.514)
], [
    500,
    400,
    500,
    100
]));

app.AddMapLayer(myRoads);
app.LoadLayersFromLocalStorage();

// TODO: Move
let layers = JSON.parse(ApiComms.GetRequest("http://localhost:3000/listlayers.php"));
layers["names"].forEach(dbLayerName => {
    app.AddMapLayer(new GeoJSONLayer(dbLayerName));
});
