import L, { LeafletEventHandlerFn } from "leaflet";
import { MapRoad } from "./maproad";
import { App } from "./app";

export class SingleMapRoad extends MapRoad {
    protected points: L.LatLng[];
    protected elevation: number[];
    readonly className: string = "SingleMapRoad";

    public constructor(
        points?: L.LatLng[],
        elevation?: number[],
        name?: string,
        color?: string,
        weight?: number,
        opacity?: number,
        smoothFactor?: number
    ) {
        super();
        this.Init(points, elevation, name, color, weight, opacity, smoothFactor);
    }

    override ClickSetElevationChart(event: L.LeafletEvent): L.LeafletMouseEventHandlerFn {
        App.Instance.SetElevationChart(this.points, this.elevation, this.layerID);
        return;
    }
}
