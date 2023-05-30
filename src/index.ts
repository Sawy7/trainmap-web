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
import { LocalEntityDB } from './localentitydb';
import { DBMapEntityCache } from './dbentitycache';
import { GeoGetter } from './geogetter';

let app = App.Instance;
app.Init(49.86, 15.51, 9);

app.LoadFromLocalStorage();

// NOTE: Did not work very well for me (disabled for now)
// // Offline storage for app assets
// if ("serviceWorker" in navigator) {
//     console.log("service worker available");
//     navigator.serviceWorker.register("/offlinestoragesw.js")
//         .then(() => console.log("Service Worker Registered"));
// }

// let ttrack = MapEntityFactory.CreateSingleMapRoad([], [], "Test Track");
// app.SetElevationChart(ttrack);

// let db = LocalEntityDB.Instance;
// async function test() {
//     let ent = await db.GetStations(49010);
//     console.log(ent);
// }

// test();

// DBMapEntityCache.Instance.GetDBStationMapMarkers(49010);

// async function uiTestTrack() {
//     let ttracks = await GeoGetter.GetRails([49010]);
//     let ttrack = ttracks[0];
//     ttrack.ClickSetElevationChart(null);
// }
// uiTestTrack();
