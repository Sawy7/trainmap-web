import L from "leaflet";
import { ApiComms } from "./apicomms";
import { SingleMapRoad } from "./singleroad";

export class DBSingleMapRoad extends SingleMapRoad {
    readonly className: string;
    readonly wasRemoved: boolean;

    constructor(dbID: number) {
        let geoJSON = JSON.parse(ApiComms.GetRequest(`http://localhost:3000/getrail.php?relcislo=${dbID}&rail=1`));

        if (geoJSON["status"] !== "ok") {
            super([], [], "");
            this.wasRemoved = true;
            this.className = "DBMultiMapRoad";
            return;
        }
        
        let type = geoJSON["geometry"]["type"];
        console.log(type);
        if (type == "LineString") {
            let lineString = geoJSON["geometry"]["coordinates"];
            let lsPoints: L.LatLng[] = [];
            let lsElevation: number[] = [];
            lineString.forEach(coords => {
                lsPoints.push(new L.LatLng(coords[1], coords[0]));
                lsElevation.push(coords[2]);
            });
            // lineStrings.forEach(ls => {
            //     let lsPoints: L.LatLng[] = [];
            //     let lsElevation: number[] = [];
            //     ls.forEach(coords => {
            //         lsPoints.push(new L.LatLng(coords[1], coords[0]));
            //         lsElevation.push(coords[2]);
            //     });
            //     mlPoints.push(lsPoints);
            //     mlElevation.push(lsElevation);
            // });
            super(
                lsPoints, lsElevation, geoJSON["properties"]["name"],
                geoJSON["properties"]["color"], geoJSON["properties"]["weight"],
                geoJSON["properties"]["opacity"], geoJSON["properties"]["smoothFactor"],
                geoJSON["properties"]["relcislo"]
            );
            this.wasRemoved = false;
            this.className = "DBMultiMapRoad";
        } else {
            console.log("Unknown feature type!")
        }
    }
}