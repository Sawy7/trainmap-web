import L, { LeafletEventHandlerFn } from "leaflet";
import { MapRoad } from "./maproad";
import { LogNotify } from "./lognotify";

export class MultiMapRoad extends MapRoad {
    protected points: L.LatLng[][];
    protected elevation: number[][];
    readonly className: string = "MultiMapRoad";

    public constructor(
        points?: L.LatLng[][],
        elevation?: number[][],
        name?: string,
        color?: string,
        weight?: number,
        opacity?: number,
        smoothFactor?: number
    ) {
        super();
        this.Init(points, elevation, name, color, weight, opacity, smoothFactor);
    }
    
    protected ClickSetElevationChart(event: L.LeafletEvent): L.LeafletMouseEventHandlerFn {
        LogNotify.PushAlert("Tato trasa není lineární a není pro ní dostupný pokročilý náhled.");
        return;
    }
}
