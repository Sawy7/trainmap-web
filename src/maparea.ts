import * as L from "leaflet";
import { MapEntity } from "./mapentity";

export class MapArea implements MapEntity {
    private points: L.LatLng[];
    private popupMsg: string;
    // private color: string;
    // private opacity: number;

    public constructor(points: L.LatLng[],
        popupMsg: string
        // color: string = "red",
        // opacity: number = 0.5,
        ) {
        this.points = points;
        this.popupMsg = popupMsg;
        // this.color = color;
        // this.opacity = opacity;
    }

    public GetMapEntity(): L.Polygon {
        var polygon = L.polygon(this.points);
        polygon.bindPopup(this.popupMsg);
        return polygon;
    }

    public GetListInfo(): string {
        return "Plocha";
    }
}
