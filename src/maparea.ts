import * as L from "leaflet";
import { MapEntity } from "./mapentity";

export class MapArea extends MapEntity {
    private points: L.LatLng[];
    private popupMsg: string;
    readonly className: string = "MapArea";
    // private color: string;
    // private opacity: number;

    public constructor(points: L.LatLng[],
        popupMsg: string,
        name: string = "Plocha"
        // color: string = "red",
        // opacity: number = 0.5,
        ) {
        super();
        this.points = points;
        this.popupMsg = popupMsg;
        this.name = name;
        // this.color = color;
        // this.opacity = opacity;
    }

    public GetMapEntity(): L.Polygon {
        var polygon = L.polygon(this.points);
        polygon.bindPopup(this.popupMsg);
        return polygon;
    }

    public GetSignificantPoint(): L.LatLng {
        return this.points[0];
    }
}
