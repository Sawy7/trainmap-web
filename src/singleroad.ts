import L from "leaflet";
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
    ) {
        super();
        this.Init(points, elevation, name);
    }

    override ClickSetElevationChart(event: L.LeafletEvent): L.LeafletMouseEventHandlerFn {
        App.Instance.SetElevationChart(this);
        return;
    }
}
