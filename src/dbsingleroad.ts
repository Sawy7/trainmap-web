import L from "leaflet";
import { ApiMgr } from "./apimgr";
import { DBMapEntity } from "./dbmapentity";
import { Helper } from "./helper";
import { SingleMapRoad } from "./singleroad";

export class DBSingleMapRoad extends SingleMapRoad {
    readonly className: string;

    private static ParseGeoJSON(geoJSON: object): [L.LatLng[], number[]] {
        let lineString = geoJSON["geometry"]["coordinates"];
        let lsPoints: L.LatLng[] = [];
        let lsElevation: number[] = [];
        lineString.forEach(coords => {
            lsPoints.push(new L.LatLng(coords[1], coords[0]));
            lsElevation.push(coords[2]);
        });

        return [lsPoints, lsElevation];
    }

    constructor(dbID: number, geoJSON?: object) {
        if (geoJSON === undefined)
            geoJSON = ApiMgr.GetRails([dbID]);

        if (geoJSON["status"] !== "ok") {
            super([], [], "");
            this.wasRemoved = true;
            this.className = "DBSingleMapRoad";
            return;
        }
        
        let type = geoJSON["geometry"]["type"];
        if (type == "LineString") {
            let lsPoints: L.LatLng[] = [];
            let lsElevation: number[] = [];
            [lsPoints, lsElevation] = DBSingleMapRoad.ParseGeoJSON(geoJSON);

            super(
                lsPoints, lsElevation, geoJSON["properties"]["name"],
                geoJSON["properties"]["color"], geoJSON["properties"]["weight"],
                geoJSON["properties"]["opacity"], geoJSON["properties"]["smoothFactor"]
            );

            this.wasRemoved = false;
            this.className = "DBSingleMapRoad";
            this.dbID = dbID;
        } else {
            console.log("Unknown feature type!")
        }
    }
}
export interface DBSingleMapRoad extends DBMapEntity {};
Helper.applyMixins(DBSingleMapRoad, [DBMapEntity]);
