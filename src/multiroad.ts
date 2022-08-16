import * as L from "leaflet";
import { MapRoad } from "./maproad";

export class MultiMapRoad extends MapRoad {
    protected points: L.LatLng[][];
    protected elevation: number[][];

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

    // private points: L.LatLng[][];
    // private elevation: number[][];
    // private color: string;
    // private weight: number;
    // private opacity: number;
    // private smoothFactor: number;

    // public constructor(points: L.LatLng[][],
    //             elevation: number[][],
    //             color: string = "red",
    //             weight: number = 5,
    //             opacity: number = 0.5,
    //             smoothFactor: number = 1
    //             ) {
    //     this.points = points;
    //     this.elevation = elevation;
    //     this.color = color;
    //     this.weight = weight;
    //     this.opacity = opacity;
    //     this.smoothFactor = smoothFactor;
    // }

    // public GetMapEntity(): L.Polyline {
    //     var polyline = new L.Polyline(this.points, {
    //         color: this.color,
    //         weight: this.weight,
    //         opacity: this.opacity,
    //         smoothFactor: this.smoothFactor
    //     });
    //     console.log(polyline.getLatLngs());
    //     this.SetupInteractivity(polyline);
    //     return polyline;
    // }

    // private SetupInteractivity(polyline: L.Polyline) {
    //     // TODO: Not working for multi
    //     polyline.on("click", (event) => {
    //         App.Instance.SetElevationChart(this.points[0], this.elevation[0]);
    //     });
    // }
}
