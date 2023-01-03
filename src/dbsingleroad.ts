import L from "leaflet";
import { ApiMgr } from "./apimgr";
import { DBMapEntity } from "./dbmapentity";
import { Helper } from "./helper";
import { SingleMapRoad } from "./singleroad";

export class DBSingleMapRoad extends SingleMapRoad {
    readonly className: string = "DBSingleMapRoad";

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
        super();
        if (geoJSON === undefined)
            geoJSON = ApiMgr.GetRails([dbID]);

        if (geoJSON["status"] !== "ok") {
            // TODO: Add method check
            this.wasRemoved = true;
            return;
        }
        
        let type = geoJSON["geometry"]["type"];
        if (type == "LineString") {
            let lsPoints: L.LatLng[] = [];
            let lsElevation: number[] = [];
            [lsPoints, lsElevation] = DBSingleMapRoad.ParseGeoJSON(geoJSON);

            this.Init(lsPoints, lsElevation, geoJSON["properties"]["name"],
                geoJSON["properties"]["color"], geoJSON["properties"]["weight"],
                geoJSON["properties"]["opacity"], geoJSON["properties"]["smoothFactor"]
            );
            this.name = geoJSON["properties"]["name"];
            this.dbID = dbID;

            this.wasRemoved = false;
        } else {
            console.log("Unknown feature type!")
        }
    }
}
export interface DBSingleMapRoad extends DBMapEntity {};
Helper.applyMixins(DBSingleMapRoad, [DBMapEntity]);
