import L from "leaflet";
import { MapMarker } from "./mapmarker";

export class DBStationMapMarker extends MapMarker {
    private orderIndex: number;
    private consumptionOrderIndex: number;
    private dbID: number;
    readonly className: string = "DBMapMarker";
    private included = true;

    constructor(geoJSON: object) {
        super();

        let type = geoJSON["geometry"]["type"];
        if (type == "Point") {
            let coords = geoJSON["geometry"]["coordinates"];
            this.Init(
                new L.LatLng(coords[1], coords[0]),
                `Název: ${geoJSON["properties"]["name"]}`,
                geoJSON["properties"]["name"],
                "custom-assets/station.svg",
                20
            );
            this.orderIndex = geoJSON["properties"]["order"];
            this.dbID = geoJSON["properties"]["id"];
        } else {
            console.log("Unknown feature type!")
        }
    }

    public GetLink(warpMethod: Function): HTMLElement {
        return undefined;
    }

    public GetOrderIndex(): number {
        if (this.consumptionOrderIndex !== undefined) {
            const toReturn = this.consumptionOrderIndex;
            this.consumptionOrderIndex = undefined;
            return toReturn;
        }
        return this.orderIndex;
    }

    public SetOrderIndex(orderIndex: number) {
        this.orderIndex = orderIndex;
    }

    public SetConsumptionOrderIndex(orderIndex: number) {
        this.consumptionOrderIndex = orderIndex;
    }

    public GetStationID(): number {
        return this.dbID;
    }

    public IsIncluded(): boolean {
        return this.included;
    }

    public ToggleIncluded() {
        this.included = !this.included;
        return this.included;
    }
}
