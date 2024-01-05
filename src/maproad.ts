import L, { LeafletEventHandlerFn } from "leaflet";
import { MapEntity } from "./mapentity";

export abstract class MapRoad extends MapEntity {
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
    ) {
        this.name = name;
        this.weight = 5;
        this.opacity = 0.5;
        this.smoothFactor = 1;
        this.linkIconName = "bi bi-bookshelf";
        this.dontSerializeList = [
            "polyLine"
        ]
        this.points = points;
        this.elevation = elevation;
    }

    public GetMapEntity(): any {
        this.polyLine = new L.Polyline(this.points, {
            weight: this.weight,
            opacity: this.opacity,
            smoothFactor: this.smoothFactor
        });
        return this.polyLine;
    }

    public GetSignificantPoint(): L.LatLng {
        const sum = this.points.flat().reduce((acc, cur) => {
            return {
                lat: acc.lat + cur.lat,
                lng: acc.lng + cur.lng
            };
        }, {lat: 0, lng: 0});

        return new L.LatLng(
            sum["lat"] / this.points.length,
            sum["lng"] / this.points.length
        );
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
