import * as L from "leaflet";
import { MapEntity } from "./mapentity";
import { App } from "./app";

export abstract class MapRoad extends MapEntity {
    // protected points: any;
    // protected elevation: any;
    protected color: string;
    protected weight: number;
    protected opacity: number;
    protected smoothFactor: number;
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

    public abstract GetMapEntity(): L.Polyline;

    public GetListInfo(): string {
        return "Cesta";
    }

    public abstract GetSignificantPoint(): L.LatLng;

    public abstract SetupInteractivity(layerID: number);
}
