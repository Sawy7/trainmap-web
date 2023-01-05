import L from "leaflet";
import { MapMarker } from "./mapmarker";

export class DBStationMapMarker extends MapMarker {
    private orderIndex: number;
    readonly className: string = "DBMapMarker";

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
        } else {
            console.log("Unknown feature type!")
        }
    }

    public GetOrderIndex(): number {
        return this.orderIndex;
    }
}
