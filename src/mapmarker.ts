import * as L from "leaflet";
import {MapEntity} from "./mapentity";

export class MapMarker extends MapEntity {
    private point: L.LatLng;
    readonly name: string;
    private popupMsg: string;
    private customIcon: L.Icon;
    public activeMarker: L.Marker;
    readonly className: string = "MapMarker";

    public constructor(
        point: L.LatLng,
        popupMsg: string,
        name: string = "Bod",
        useCustomIcon: boolean = false,
        dbID: number = undefined
    ) {
        super(dbID);
        this.point = point;
        this.popupMsg = popupMsg;
        this.name = name;
        this.dontSerializeList = [
            "customIcon",
            "activeMarker"
        ]
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

    public GetSignificantPoint(): L.LatLng {
        return this.point;
    }

    public ChangeCoordinates(point: L.LatLng) {
        this.activeMarker.setLatLng(point);
    }

    // public override Serialize(): Object {
    //     let object = this;
    //     delete object.polyLine;
    //     return object;
    // }
}
