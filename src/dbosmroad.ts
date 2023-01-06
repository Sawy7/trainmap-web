import L from "leaflet";
import { ApiMgr } from "./apimgr";
import { DBMapEntity } from "./dbmapentity";
import { Helper } from "./helper";
import { LogNotify } from "./lognotify";
import { MapRoad } from "./maproad";
import { MultiMapRoad } from "./multiroad";

export class DBOSMMapRoad extends MapRoad {
    private delegate: MultiMapRoad;
    readonly className: string = "DBOSMMapRoad";

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

    public constructor(geoJSON?: object) {
        super();
        if (geoJSON["status"] !== "ok") {
            // TODO: Add method check
            this.wasRemoved = true;
            return;
        }
        
        let type = geoJSON["geometry"]["type"];
        if (type == "MultiLineString") {
            let mlPoints: L.LatLng[][] = [];
            let mlElevation: number[][] = [];
            [mlPoints, mlElevation] = DBOSMMapRoad.ParseGeoJSON(geoJSON);

            this.delegate = new MultiMapRoad(mlPoints, mlElevation, geoJSON["properties"]["name"],
                geoJSON["properties"]["color"], geoJSON["properties"]["weight"],
                geoJSON["properties"]["opacity"], geoJSON["properties"]["smoothFactor"]
            );
            this.name = geoJSON["properties"]["name"];
            
            this.wasRemoved = false;
            this.dbID = geoJSON["properties"]["relcislo"];
        } else {
            console.log("Unknown feature type!");
        }
    }

    public GetMapEntity(): any {
        return this.delegate.GetMapEntity();
    }

    public GetSignificantPoint(): L.LatLng {
        return this.delegate.GetSignificantPoint();
    }

    public SetupInteractivity(layerID: number) {
        this.delegate.SetupInteractivity(layerID, this.ClickSetElevationChart);
    }

    // Don't create lineators for OSM
    protected ClickSetElevationChart(event: L.LeafletEvent): L.LeafletMouseEventHandlerFn {
        LogNotify.PushAlert("Tato trasa neobsahuje výškový profil. (Source: OSM)");
        return;
    }

    public GetEntityDBObject(): object {
        return {
            "type": this.className,
            "id": this.dbID,
            "points": this.points,
            "elevation": this.elevation
        }
    }
}
export interface DBOSMMapRoad extends DBMapEntity {};
Helper.applyMixins(DBOSMMapRoad, [DBMapEntity]);
