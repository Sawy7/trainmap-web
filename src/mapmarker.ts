import * as L from "leaflet";
import {MapEntity} from "./mapentity";

export class MapMarker extends MapEntity {
    private point: L.LatLng;
    private popupMsg: string;
    private customIcon: L.Icon;
    public activeMarker: L.Marker;
    readonly className: string = "MapMarker";

    public constructor(point: L.LatLng, popupMsg: string, useCustomIcon: boolean = false) {
        super();
        this.point = point;
        this.popupMsg = popupMsg;
        if (useCustomIcon)
            this.CreateCustomIcon();
    }

    private CreateCustomIcon() {
        this.customIcon = L.icon({
            iconUrl: "custom-assets/elevation-pointer.png",
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });
    }

    public GetMapEntity(): L.Marker {
        if (this.activeMarker === undefined)
        {
            if (this.customIcon === undefined)
                this.activeMarker = L.marker([this.point.lat, this.point.lng]);
            else
                this.activeMarker = L.marker([this.point.lat, this.point.lng], {icon: this.customIcon});
            if (this.popupMsg != "")
                this.activeMarker.bindPopup(this.popupMsg);
        }
        return this.activeMarker;
    }

    public GetListInfo(): string {
        return "Bod";
    }

    public GetSignificantPoint(): L.LatLng {
        return this.point;
    }

    public ChangeCoordinates(point: L.LatLng) {
        this.activeMarker.setLatLng(point);
    }
}
