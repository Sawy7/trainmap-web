import * as L from "leaflet";
import { MapRoad } from "./maproad";
import { App } from "./app";

export class SingleMapRoad extends MapRoad {
    private points: L.LatLng[];
    private elevation: number[];
    readonly className: string = "SingleMapRoad";

    public constructor(points: L.LatLng[],
                elevation: number[],
                name: string = "Cesta",
                color: string = "red",
                weight: number = 5,
                opacity: number = 0.5,
                smoothFactor: number = 1,
                dbID: number = undefined
                ) {
        super(name, color, weight, opacity, smoothFactor, dbID);
        this.points = points;
        this.elevation = elevation;
    }

    public GetMapEntity(): L.Polyline {
        this.polyLine = new L.Polyline(this.points, {
            color: this.color,
            weight: this.weight,
            opacity: this.opacity,
            smoothFactor: this.smoothFactor
        });
        return this.polyLine;
    }

    public AddPoint(point: L.LatLng, elevation: number) {
        this.points.push(point);
        this.elevation.push(elevation);
    }

    public GetSignificantPoint(): L.LatLng {
        return this.points[0];
    }

    public SetupInteractivity(layerID: number) {
        this.polyLine.on("click", (event) => {
            App.Instance.SetElevationChart(this.points, this.elevation, layerID);
        });
    }
}
