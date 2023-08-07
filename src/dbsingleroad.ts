import L from "leaflet";
import { DBMapEntity } from "./dbmapentity";
import { Helper } from "./helper";
import { SingleMapRoad } from "./singleroad";
import { ApiMgr } from "./apimgr";
import { TrainCard } from "./traincard";

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

            this.Init(lsPoints, lsElevation, geoJSON["properties"]["name"]);
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

    public CalcConsumption(
        selectedTrainCard: TrainCard, recuperationCoef: number,
        isReversed: boolean
    ): object {
        // return ApiMgr.CalcConsumption(this.dbID);
        
        // Using external Python API now:
        let stationIDs = this.GetStations().reduce((ids, s) => {
            if (s.IsIncluded())
                ids.push(s.GetStationID());
            return ids;
        }, []);
        return ApiMgr.CalcConsumptionExt(
            this.dbID, stationIDs,
            selectedTrainCard.massLocomotive, selectedTrainCard.massWagon,
            selectedTrainCard.powerLimit, recuperationCoef,
            isReversed
        );
    }
}
export interface DBSingleMapRoad extends DBMapEntity {};
Helper.applyMixins(DBSingleMapRoad, [DBMapEntity]);
