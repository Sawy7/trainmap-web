import * as L from "leaflet";
import { ApiComms } from "./apicomms";
import { Lineator } from "./lineator";
import { MultiMapRoad } from "./multiroad";
import { RoadGroup } from "./roadgroup";

export class DBMultiMapRoad extends MultiMapRoad {
    readonly className: string;
    readonly wasRemoved: boolean

    public constructor(dbID: number) {
        // let geoJSON = JSON.parse(ApiComms.GetRequest(`${window.location.protocol}//${window.location.host}/getelement.php?id=${dbID}`));
        let geoJSON = JSON.parse(ApiComms.GetRequest(`http://localhost:3000/getelement.php?id=${dbID}`));

        if (geoJSON["status"] !== "ok") {
            super([], [], "");
            this.wasRemoved = true;
            this.className = "DBMultiMapRoad";
            return;
        }
        
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
            super(
                mlPoints, mlElevation, geoJSON["properties"]["name"],
                geoJSON["properties"]["color"], geoJSON["properties"]["weight"],
                geoJSON["properties"]["opacity"], geoJSON["properties"]["smoothFactor"],
                geoJSON["properties"]["id"]
            );
            this.wasRemoved = false;
            this.className = "DBMultiMapRoad";
        } else {
            console.log("Unknown feature type!")
        }
    }

    protected PrepareLineator(points: L.LatLng[][], elevation: number[][]) {
        // In case of removed DB road
        if (this.dbID === undefined)
            return;
        
            // TODO: Add agnostic URL for API
        let gidList = JSON.parse(ApiComms.GetRequest(`http://localhost:3000/getgids.php?id=${this.dbID}`));
        let roadGroups: RoadGroup[] = [];
        for (let i = 0; i < points.length; i++) {
            roadGroups.push(new RoadGroup(points[i], elevation[i], gidList["gids"][i]));
        }
        this.lineator = new Lineator(roadGroups);
        this.InsertDBLineatorHierarchy();
    }

    public InsertDBLineatorHierarchy() {
        this.lineator.InsertDBHierarchy(this.dbID);
    }
}