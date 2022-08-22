import * as L from "leaflet";
import { Lineator } from "./lineator";
import { MapRoad } from "./maproad";
import { RoadGroup } from "./roadgroup";

export class MultiMapRoad extends MapRoad {
    protected points: L.LatLng[][];
    protected elevation: number[][];
    public lineator: Lineator;
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

        let roadGroups: RoadGroup[] = [];
        for (let i = 0; i < points.length; i++) {
            roadGroups.push(new RoadGroup(points[i], elevation[i]));
        }
        this.dontSerializeList.push("lineator");
        this.lineator = new Lineator(roadGroups);
    }

    public GetSignificantPoint(): L.LatLng {
        return this.points[0][0];
    }
}
