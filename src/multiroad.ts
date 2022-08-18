import * as L from "leaflet";
import { MapRoad } from "./maproad";

export class MultiMapRoad extends MapRoad {
    protected points: L.LatLng[][];
    protected elevation: number[][];
    readonly className: string = "MultiMapRoad";

    public constructor(points: L.LatLng[][],
                elevation: number[][],
                color: string = "red",
                weight: number = 5,
                opacity: number = 0.5,
                smoothFactor: number = 1
                ) {
        super(color, weight, opacity, smoothFactor);
        this.points = points;
        this.elevation = elevation;
    }

    public GetSignificantPoint(): L.LatLng {
        return this.points[0][0];
    }
}
