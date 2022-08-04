import * as L from "leaflet";
import {MapEntity} from "./mapentity";

export class MapMarker implements MapEntity {
    public point: L.LatLng;
    public popupMsg: string;
    public activeMarker: L.Marker;

    public constructor(point: L.LatLng, popupMsg: string) {
        this.point = point;
        this.popupMsg = popupMsg;
    }

    public GetMapEntity(): L.Marker {
        if (this.activeMarker === undefined)
        {
            this.activeMarker = L.marker([this.point.lat, this.point.lng]);
            this.activeMarker.bindPopup(this.popupMsg);
        }
        return this.activeMarker;
    }

    public ChangeCoordinates(point: L.LatLng) {
        this.activeMarker.setLatLng(point);
    }
}
