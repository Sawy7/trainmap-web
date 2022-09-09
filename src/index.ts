// External imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'font-awesome/css/font-awesome.min.css';

import L from "leaflet";
import 'leaflet/dist/leaflet.css';
delete L.Icon.Default.prototype['_getIconUrl' as any as keyof L.Icon.Default];
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
    iconUrl: require('leaflet/dist/images/marker-icon.png').default,
    shadowUrl: require('leaflet/dist/images/marker-shadow.png').default
});

// Internal imports
import { App } from "./app";
import { MapEntityFactory } from './mapentityfactory';

let app = App.Instance;
app.Init(49.86, 15.51, 15);

// First test layer (BODY)
let myPoints = MapEntityFactory.CreateMapLayer("Moje body #1");

myPoints.AddMapMarker(MapEntityFactory.CreateMapMarker(new L.LatLng(49.86, 15.511), "This is a popup #1"));
myPoints.AddMapMarker(MapEntityFactory.CreateMapMarker(new L.LatLng(49.86, 15.512), "This is a popup #2"));
myPoints.AddMapMarker(MapEntityFactory.CreateMapMarker(new L.LatLng(49.86, 15.513), "This is a popup #3"));
myPoints.AddMapMarker(MapEntityFactory.CreateMapMarker(new L.LatLng(49.86, 15.514), "This is a popup #4"));

app.AddMapLayer(myPoints);

// Second test layer (CESTY)
let myRoads = MapEntityFactory.CreateMapLayer("Moje cesty #1");

myRoads.AddMapRoad(MapEntityFactory.CreateSingleMapRoad([
    new L.LatLng(49.86, 15.511),
    new L.LatLng(49.861, 15.512),
    new L.LatLng(49.86, 15.513),
    new L.LatLng(49.86, 15.514)
], [
    500,
    100,
    500,
    100
], "Cesta #1", "blue"));
myRoads.AddMapRoad(MapEntityFactory.CreateSingleMapRoad([
    new L.LatLng(49.859, 15.511),
    new L.LatLng(49.859, 15.512),
    new L.LatLng(49.858, 15.513),
    new L.LatLng(49.859, 15.514)
], [
    500,
    400,
    500,
    100
], "Cesta #2"));

app.AddMapLayer(myRoads);
// app.LoadLayersFromLocalStorage();
app.LoadFromLocalStorage();
