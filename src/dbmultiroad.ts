import * as L from "leaflet";
import { ApiComms } from "./apicomms";
import { MultiMapRoad } from "./multiroad";

export class DBMultiMapRoad extends MultiMapRoad {
    public constructor(
                id: number,
                name: string = "Cesta",
                color: string = "red",
                weight: number = 5,
                opacity: number = 0.5,
                smoothFactor: number = 1
    ) {
        // let geoJSON = JSON.parse(ApiComms.GetRequest(`${window.location.protocol}//${window.location.host}/getlayer.php?id=${id}`));
        let geoJSON = JSON.parse(ApiComms.GetRequest(`http://localhost:3000/getlayer.php?id=${id}`));
        
        let type = geoJSON["geometry"]["type"];
        if (type == "MultiLineString") {
            let lineStrings = geoJSON["geometry"]["coordinates"];
            let mlPoints: L.LatLng[][] = [];
            let mlElevation: number[][] = [];
            lineStrings.forEach(ls => {
                let lsPoints: L.LatLng[] = [];
                let lsElevation: number[] = [];
                ls.forEach(coords => {
                    lsPoints.push(new L.LatLng(coords[1], coords[0]));
                    lsElevation.push(coords[2]);
                });
                mlPoints.push(lsPoints);
                mlElevation.push(lsElevation);
            });
            super(mlPoints, mlElevation, name, color, weight, opacity, smoothFactor);
        } else {
            console.log("Unknown feature type!")
        }
        
    }
}