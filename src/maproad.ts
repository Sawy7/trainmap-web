import L from "leaflet";
import { MapEntity } from "./mapentity";

export abstract class MapRoad extends MapEntity {
    // protected points: any;
    // protected elevation: any;
    protected color: string;
    protected weight: number;
    protected opacity: number;
    protected smoothFactor: number;
    protected polyLine: L.Polyline;
    protected layerID: number;
    readonly className: string = "MapRoad";

    protected constructor(
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
    }

    public abstract GetMapEntity(): any;

    public abstract GetSignificantPoint(): L.LatLng;

    public SetupInteractivity(layerID: number) {
        this.layerID = layerID;
        this.polyLine.on("click", this.ClickSetElevationChart.bind(this));
    }

    protected abstract ClickSetElevationChart(event: L.LeafletEvent): L.LeafletMouseEventHandlerFn;
}
