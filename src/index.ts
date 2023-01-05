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
app.Init(49.86, 15.51, 9);

// app.LoadLayersFromLocalStorage();
app.LoadFromLocalStorage();

// let ttrack = MapEntityFactory.CreateSingleMapRoad([], [], "Test Track");
// app.SetElevationChart(ttrack);
