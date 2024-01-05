// External imports
import 'bootstrap/dist/css/bootstrap.min.css';
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
import { ManagerApp } from './managerapp';

let app = ManagerApp.Instance;
app.Init(49.86, 15.51, 9);