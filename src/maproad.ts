import * as L from "leaflet";
import { MapEntity } from "./mapentity";
import { App } from "./app";

export abstract class MapRoad extends MapEntity {
    protected points: any;
    protected elevation: any;
    private color: string;
    private weight: number;
    private opacity: number;
    private smoothFactor: number;
    protected polyLine: L.Polyline;
    readonly className: string = "MapRoad";

    protected constructor(
                color: string = "red",
                weight: number = 5,
                opacity: number = 0.5,
                smoothFactor: number = 1
                ) {
        super();
        this.color = color;
        this.weight = weight;
        this.opacity = opacity;
        this.smoothFactor = smoothFactor;
        this.dontSerializeList = [
            "polyLine"
        ]
    }

    public GetMapEntity(): L.Polyline {
        this.polyLine = new L.Polyline(this.points, {
            color: this.color,
            weight: this.weight,
            opacity: this.opacity,
            smoothFactor: this.smoothFactor
        });
        // this.SetupInteractivity();
        return this.polyLine;
    }

    public GetListInfo(): string {
        return "Cesta";
    }

    public abstract GetSignificantPoint(): L.LatLng;

    public SetupInteractivity(layerName: string) {
        // this.polyLine.on("mouseover", function (event) {
        //     let mouseMarker = new MapMarker(event["latlng"], "This is a popup #1");
        //     App.Instance.RenderElevationMarker(new L.LatLng(event["latlng"]["lat"], event["latlng"]["lng"]));
        // });

        // this.polyLine.on("mouseout", function (event) {
        //     console.log("out");
        // });

        this.polyLine.on("click", (event) => {
            App.Instance.SetElevationChart(this.points, this.elevation, layerName);
        });
    }
}
