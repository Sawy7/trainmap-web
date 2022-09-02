import * as L from "leaflet";
import { ApiComms } from "./apicomms";
import { Lineator } from "./lineator";
import { MultiMapRoad } from "./multiroad";
import { RoadGroup } from "./roadgroup";

export class DBMultiMapRoad extends MultiMapRoad {
    readonly className: string;

    public constructor(infoObject: Object) {
        // let geoJSON = JSON.parse(ApiComms.GetRequest(`${window.location.protocol}//${window.location.host}/getlayer.php?id=${id}`));
        let geoJSON = JSON.parse(ApiComms.GetRequest(`http://localhost:3000/getlayer.php?id=${infoObject["id"]}`));
        
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
                mlPoints, mlElevation, infoObject["name"],
                infoObject["color"], infoObject["weight"],
                infoObject["opacity"], infoObject["smoothFactor"],
                infoObject["id"]
            );
            this.className = "DBMultiMapRoad";
        } else {
            console.log("Unknown feature type!")
        }
    }

    protected PrepareLineator(points: L.LatLng[][], elevation: number[][]) {
        let roadGroups: RoadGroup[] = [];
        let gidList = JSON.parse(ApiComms.GetRequest(`http://localhost:3000/getgids.php?id=${this.id}`));
        for (let i = 0; i < points.length; i++) {
            roadGroups.push(new RoadGroup(points[i], elevation[i], gidList["gids"][i]));
        }
        this.lineator = new Lineator(roadGroups);
        this.InsertDBLineatorHierarchy();
    }

    public InsertDBLineatorHierarchy() {
        this.lineator.InsertDBHierarchy(this.id);
    }
}