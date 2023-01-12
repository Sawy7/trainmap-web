import L, { LeafletEventHandlerFn } from "leaflet";
import { MapEntity } from "./mapentity";

export abstract class MapRoad extends MapEntity {
    protected color: string;
    protected weight: number;
    protected opacity: number;
    protected smoothFactor: number;
    protected polyLine: L.Polyline;
    protected layerID: number;
    protected points: L.LatLng[] | L.LatLng[][];
    protected elevation: number[] | number[][];
    readonly className: string = "MapRoad";

    protected constructor() {
        super();
    }

    protected Init(
        points: L.LatLng[] | L.LatLng[][],
        elevation: number[] | number[][],
        name: string = "Cesta",
        color: string = "red",
        weight: number = 5,
        opacity: number = 0.5,
        smoothFactor: number = 1
    ) {
        this.name = name;
        this.color = color;
        this.weight = weight;
        this.opacity = opacity;
        this.smoothFactor = smoothFactor;
        this.linkIconName = "bi bi-bookshelf";
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
        return this.points.flat()[0];
    }

    public SetupInteractivity(layerID: number, customFunction?: LeafletEventHandlerFn) {
        this.layerID = layerID;
        if (customFunction !== undefined)
            this.polyLine.on("click", customFunction);
        else
            this.polyLine.on("click", this.ClickSetElevationChart.bind(this));
    }

    protected ClickSetElevationChart(event: L.LeafletEvent): L.LeafletMouseEventHandlerFn {
        return; // This is never used
    };

    public GetPoints(): L.LatLng[] | L.LatLng[][] {
        return this.points;
    }

    public GetElevation(): number[] | number[][] {
        return this.elevation;
    }

    public GetLayerID(): number {
        return this.layerID;
    }
}
