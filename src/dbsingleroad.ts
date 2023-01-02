import L from "leaflet";
import { ApiMgr } from "./apimgr";
import { DBMapEntity } from "./dbmapentity";
import { Helper } from "./helper";
import { MapRoad } from "./maproad";
import { SingleMapRoad } from "./singleroad";

export class DBSingleMapRoad extends MapRoad {
    private delegate: SingleMapRoad;
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

            this.delegate = new SingleMapRoad(lsPoints, lsElevation, geoJSON["properties"]["name"],
                geoJSON["properties"]["color"], geoJSON["properties"]["weight"],
                geoJSON["properties"]["opacity"], geoJSON["properties"]["smoothFactor"]
            );
            this.name = geoJSON["properties"]["name"];

            this.wasRemoved = false;
            this.dbID = dbID;
        } else {
            console.log("Unknown feature type!")
        }
    }

    public GetMapEntity(): any {
        return this.delegate.GetMapEntity();
    }

    public GetSignificantPoint(): L.LatLng {
        return this.delegate.GetSignificantPoint();
    }

    public SetupInteractivity(layerID: number) {
        this.delegate.SetupInteractivity(layerID);
    }
}
export interface DBSingleMapRoad extends DBMapEntity {};
Helper.applyMixins(DBSingleMapRoad, [DBMapEntity]);
