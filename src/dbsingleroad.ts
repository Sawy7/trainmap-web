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

    constructor(geoJSON?: object) {
        super();
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
            this.dbID = geoJSON["properties"]["relcislo"];

            this.wasRemoved = false;
        } else {
            console.log("Unknown feature type!")
        }
    }

    public GetEntityDBObject(): object {
        return {
            "type": this.className,
            "id": this.dbID,
            "points": this.points,
            "elevation": this.elevation
        }
    }

    // public GetGeoJSON(): object {
    //     let coords: number[][];
    //     for (let i = 0; i < this.points.length; i++) {
    //         const p = this.points[i];
    //         const e = this.elevation[i];
    //         coords.push([p.lat, p.lng, e]);
    //     }
    //     return {
    //         "type": "Feature",
    //         "geometry": {
    //             "type": "LineString",
    //             "coordinates": coords 
    //         },
    //         "properties": {
    //             "relcislo": this.dbID,
    //             "name": this.name,
    //             "color": this.color,
    //             "weight": this.weight,
    //             "opacity": this.opacity,
    //             "smooth_factor": this.smoothFactor,
    //             // TODO: Missing id and tags
    //         },
    //         "status": "ok"
    //     }
    // }
}
export interface DBSingleMapRoad extends DBMapEntity {};
Helper.applyMixins(DBSingleMapRoad, [DBMapEntity]);
