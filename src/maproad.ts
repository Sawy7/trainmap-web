import * as L from "leaflet";
import { MapEntity } from "./mapentity";
import { MapMarker } from "./mapmarker";
import { App } from "./app";

export class MapRoad implements MapEntity {
    private points: L.LatLng[];
    // private popupMsg: string;
    private color: string;
    private weight: number;
    private opacity: number;
    private smoothFactor: number;

    public constructor(points: L.LatLng[],
                // popupMsg: string,
                color: string = "red",
                weight: number = 5,
                opacity: number = 0.5,
                smoothFactor: number = 1
                ) {
        this.points = points;
        // this.popupMsg = popupMsg;
        this.color = color;
        this.weight = weight;
        this.opacity = opacity;
        this.smoothFactor = smoothFactor;
    }

    public GetMapEntity(): L.Polyline {
        var polyline = new L.Polyline(this.points, {
            color: this.color,
            weight: this.weight,
            opacity: this.opacity,
            smoothFactor: this.smoothFactor
        });
        // polyline.bindPopup(this.popupMsg); // TODO: Remove properly
        this.SetupInteractivity(polyline);
        return polyline;
    }

    private SetupInteractivity(polyline: L.Polyline) {
        // polyline.on("mouseover", function (event) {
        //     let mouseMarker = new MapMarker(event["latlng"], "This is a popup #1");
        //     App.Instance.RenderRogueMarker(mouseMarker);
        // });

        // polyline.on("mouseout", function (event) {
        //     console.log("out");
        // });

        polyline.on("click", function (event) {
            App.Instance.SetElevationChart();
        });
    }
}
