import { MapEntity } from "./mapentity";
import { MapEntityFactory } from "./mapentityfactory";
import { MapMarker } from "./mapmarker";

export abstract class DBMapEntity extends MapEntity {
    protected dbID: number;
    private POIs: MapMarker[];
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

    public AddStations(geoJSON: object[]) {
        if (this.POIs === undefined)
            this.POIs = [];

        geoJSON["features"].forEach(sf => {
            this.POIs.push(MapEntityFactory.CreateDBStationMapMarker(sf));
        });
    }

    public GetAdjacentMapEntities(): any {
        if (this.POIs === undefined)
            return [];
        return this.POIs;
        // return this.POIs.map((p) => {
        //     return p.GetMapEntity();
        // });
    }
}