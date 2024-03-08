import L from "leaflet";
import { DBMapEntity } from "./dbmapentity";
import { Helper } from "./helper";
import { SingleMapRoad } from "./singleroad";
import { ApiMgr } from "./apimgr";
import { TrainCard } from "./traincard";

export class DBSingleMapRoad extends SingleMapRoad {
    private consumptionPoints: L.LatLng[];
    private consumptionElevation: number[];
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

    // Right after calculating the consumption, this gives modified (API) values (only once)
    override GetPoints(): L.LatLng[] {
        if (this.consumptionPoints !== undefined) {
            const toReturn = this.consumptionPoints;
            this.consumptionPoints = undefined;
            return toReturn;
        }
        return super.GetPoints() as L.LatLng[];
    }

    // Right after calculating the consumption, this gives modified (API) values (only once)
    override GetElevation(): number[] {
        if (this.consumptionElevation !== undefined) {
            const toReturn = this.consumptionElevation;
            this.consumptionElevation = undefined;
            return toReturn;
        }
        return super.GetElevation() as number[];
    }

    public CalcConsumption(selectedTrainCard: TrainCard, isReversed: boolean): object {
        // Using external Python/GO API:
        let stationIDs = this.GetStations().reduce((ids, s) => {
            if (s.IsIncluded())
                ids.push(s.GetStationID());
            return ids;
        }, []);
        const consumptionJSON = ApiMgr.CalcConsumptionExt(
            this.dbID, stationIDs,
            selectedTrainCard.params,
            selectedTrainCard.variableParams,
            isReversed
        );
        if (consumptionJSON["status"] == "ok"){
            this.consumptionPoints = consumptionJSON["Data"]["rail_definition"]["coordinates"].map(coord => new L.LatLng(coord[1], coord[0]));
            this.consumptionElevation = consumptionJSON["Data"]["elevation_values"];
            const stationOrders = consumptionJSON["Data"]["rail_definition"]["station_orders"];

            if (isReversed)
                stationOrders.reverse();
            this.SetPOIConsumptionOrderIndices(stationOrders);
        }
        return consumptionJSON;
    }
}
export interface DBSingleMapRoad extends DBMapEntity {};
Helper.applyMixins(DBSingleMapRoad, [DBMapEntity]);
