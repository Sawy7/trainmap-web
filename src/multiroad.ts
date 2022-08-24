import * as L from "leaflet";
import { Lineator } from "./lineator";
import { MapRoad } from "./maproad";
import { RoadGroup } from "./roadgroup";
import { App } from "./app";

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
    }

    private EngageLineator() {
        let roadGroups: RoadGroup[] = [];
        for (let i = 0; i < this.points.length; i++) {
            roadGroups.push(new RoadGroup(this.points[i], this.elevation[i]));
        }
        this.dontSerializeList.push("lineator");
        this.lineator = new Lineator(roadGroups);
    }

    public GetSignificantPoint(): L.LatLng {
        return this.points[0][0];
    }

    public override SetupInteractivity(layerName: string) {
        this.polyLine.on("click", (event) => {
            //App.Instance.SetElevationChart(this.points, this.elevation, layerName);
            if (this.lineator === undefined) {
                App.Instance.PushAlert(
                    "Pro tuto trasu nebyla vytvořena interní strategie výškového průchodu.",
                    "Vytvořit nyní?",
                    this.EngageLineator.bind(this)
                );
            } else {
                let chartPoints = this.lineator.GenerateChartPoints();
                App.Instance.SetElevationChart(chartPoints[0], chartPoints[1], layerName);
            }
        });
    }
}
