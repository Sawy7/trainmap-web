import L from "leaflet";
import { ApiMgr } from "./apimgr";
import { DBMapEntity } from "./dbmapentity";
import { Helper } from "./helper";
import { LogNotify } from "./lognotify";
import { MultiMapRoad } from "./multiroad";

export class DBOSMMapRoad extends MultiMapRoad {
    readonly className: string;

    private static ParseGeoJSON(geoJSON: object): [L.LatLng[][], number[][]] {
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

        return [mlPoints, mlElevation];
    }

    public constructor(dbID: number, geoJSON?: object) {
        if (geoJSON === undefined)
            geoJSON = ApiMgr.GetOSMRail(dbID);

        if (geoJSON["status"] !== "ok") {
            super([], [], "");
            this.wasRemoved = true;
            this.className = "DBOSMMapRoad";
            return;
        }
        
        let type = geoJSON["geometry"]["type"];
        if (type == "MultiLineString") {
            let mlPoints: L.LatLng[][] = [];
            let mlElevation: number[][] = [];
            [mlPoints, mlElevation] = DBOSMMapRoad.ParseGeoJSON(geoJSON);

            super(
                [], [], geoJSON["properties"]["name"],
                geoJSON["properties"]["color"], geoJSON["properties"]["weight"],
                geoJSON["properties"]["opacity"], geoJSON["properties"]["smoothFactor"]
            );
            
            this.wasRemoved = false;
            this.className = "DBOSMMapRoad";
            this.dbID = dbID;
            this.PrepareLineator(mlPoints, mlElevation);
        } else {
            console.log("Unknown feature type!");
        }
    }

    // Don't create lineators for OSM
    protected ClickSetElevationChart(event: L.LeafletEvent): L.LeafletMouseEventHandlerFn {
        LogNotify.PushAlert("Tato trasa neobsahuje výškový profil. (Source: OSM)");
        return;
    }
}
export interface DBOSMMapRoad extends DBMapEntity {};
Helper.applyMixins(DBOSMMapRoad, [DBMapEntity]);
