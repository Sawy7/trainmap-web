import { DBStationMapMarker } from "./dbstationmarker";
import { MapEntity } from "./mapentity";

export abstract class DBMapEntity extends MapEntity {
    protected dbID: number;
    private POIs: DBStationMapMarker[];
    protected wasRemoved: boolean;

    public GetLocalStorageObject(): object {
        return {
            "type": this.className,
            "id": this.dbID
        }
    }

    public CheckRemoved() {
        return this.wasRemoved;
    }

    public AddStations(stations: DBStationMapMarker[]) {
        if (this.POIs === undefined)
            this.POIs = [];

        this.POIs.push(...stations);
        // TODO: Fix
        // geoJSON["features"].forEach(sf => {
        //     this.POIs.push(MapEntityFactory.CreateDBStationMapMarker(sf));
        // });
    }

    protected SetPOIConsumptionOrderIndices(orders: number[]) {
        let i = 0;
        if (this.POIs !== undefined) {
            this.POIs.forEach(station => {
                if (!station.IsIncluded())
                    return;
                station.SetConsumptionOrderIndex(orders[i++]);
            });
        }
    }

    public GetAdjacentMapEntities(): any {
        if (this.POIs === undefined)
            return [];
        return this.POIs;
    }

    public GetStations(): DBStationMapMarker[] {
        return this.POIs;
    }
}