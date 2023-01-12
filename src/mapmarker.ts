import L from "leaflet";
import {MapEntity} from "./mapentity";

export class MapMarker extends MapEntity {
    private point: L.LatLng;
    private popupMsg: string;
    private customIcon: L.Icon;
    public activeMarker: L.Marker;
    readonly className: string = "MapMarker";

    public constructor(
        point?: L.LatLng,
        popupMsg?: string,
        name?: string,
        customIconPath?: string,
        customIconSize?: number
    ) {
        super();
        this.Init(point, popupMsg, name, customIconPath, customIconSize);
    }

    protected Init(
        point: L.LatLng,
        popupMsg: string,
        name: string = "Bod",
        customIconPath?: string,
        customIconSize?: number
    ) {
        this.point = point;
        this.popupMsg = popupMsg;
        this.name = name;
        this.linkIconName = "bi-signpost-split-fill";
        this.dontSerializeList = [
            "customIcon",
            "activeMarker"
        ]
        if (customIconPath !== undefined)
            this.CreateCustomIcon(customIconPath, customIconSize);
    }

    private CreateCustomIcon(customIconPath: string, customIconSize: number) {
        this.customIcon = L.icon({
            iconUrl: customIconPath,
            iconSize: [customIconSize, customIconSize],
            iconAnchor: [customIconSize/2, customIconSize/2]
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
