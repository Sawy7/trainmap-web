import * as L from "leaflet";
import {MapEntity} from "./mapentity";

export class MapMarker implements MapEntity {
    private point: L.LatLng;
    private popupMsg: string;
    private customIcon: L.Icon;
    public activeMarker: L.Marker;

    public constructor(point: L.LatLng, popupMsg: string, useCustomIcon: boolean = false) {
        this.point = point;
        this.popupMsg = popupMsg;
        if (useCustomIcon)
        {
            console.log("using custom");
            this.CreateCustomIcon();
        }
    }

    private CreateCustomIcon() {
        this.customIcon = L.icon({
            iconUrl: "custom-assets/elevation-pointer.png",
            // shadowUrl: "custom-assets/leaf-shadow.png",

            iconSize:     [14, 14], // size of the icon
            // shadowSize:   [50, 64], // size of the shadow
            iconAnchor:   [7, 7], // point of the icon which will correspond to marker's location
            // shadowAnchor: [4, 62],  // the same for the shadow
            // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
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

    public ChangeCoordinates(point: L.LatLng) {
        this.activeMarker.setLatLng(point);
    }
}
