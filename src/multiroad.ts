import L, { LeafletEventHandlerFn } from "leaflet";
import { MapRoad } from "./maproad";
import { LogNotify } from "./lognotify";

export class MultiMapRoad extends MapRoad {
    protected color: string;
    protected weight: number;
    protected opacity: number;
    protected smoothFactor: number;
    protected polyLine: L.Polyline;
    protected layerID: number;
    protected points: L.LatLng[][];
    protected elevation: number[][];
    readonly className: string = "MultiMapRoad";

    public constructor(
                points: L.LatLng[][],
                elevation: number[][],
                name: string = "Cesta",
                color: string = "red",
                weight: number = 5,
                opacity: number = 0.5,
                smoothFactor: number = 1
    ) {
        super();
        this.name = name;
        this.color = color;
        this.weight = weight;
        this.opacity = opacity;
        this.smoothFactor = smoothFactor;
        this.dontSerializeList = [
            "polyLine"
        ]
        this.points = points;
        this.elevation = elevation;
    }

    public GetMapEntity(): any {
        this.polyLine = new L.Polyline(this.points, {
            color: this.color,
            weight: this.weight,
            opacity: this.opacity,
            smoothFactor: this.smoothFactor
        });
        return this.polyLine;
    }

    public GetSignificantPoint(): L.LatLng {
        return this.points[0][0];
    }
    
    public SetupInteractivity(layerID: number, customFunction?: LeafletEventHandlerFn) {
        this.layerID = layerID;
        if (customFunction !== undefined)
            this.polyLine.on("click", customFunction);
        else
            this.polyLine.on("click", this.ClickSetElevationChart.bind(this));
    }

    protected ClickSetElevationChart(event: L.LeafletEvent): L.LeafletMouseEventHandlerFn {
        LogNotify.PushAlert("Tato trasa není lineární a není pro ní dostupný pokročilý náhled.");
        return;
    }
}
