import * as L from "leaflet";
import { Lineator } from "./lineator";
import { MapRoad } from "./maproad";
import { RoadGroup } from "./roadgroup";
import { App } from "./app";

export class MultiMapRoad extends MapRoad {
    public lineator: Lineator;
    readonly className: string = "MultiMapRoad";

    public constructor(points: L.LatLng[][],
                elevation: number[][],
                name: string = "Cesta",
                color: string = "red",
                weight: number = 5,
                opacity: number = 0.5,
                smoothFactor: number = 1,
                id: number = undefined
    ) {
        super(name, color, weight, opacity, smoothFactor, id);
        this.dontSerializeList.push("lineator"); // TODO: Investigate, why this is not neccessary
        
        this.PrepareLineator(points, elevation);
    }

    public GetMapEntity(): L.Polyline {
        this.polyLine = new L.Polyline(this.lineator.GetPoints(), {
            color: this.color,
            weight: this.weight,
            opacity: this.opacity,
            smoothFactor: this.smoothFactor
        });
        return this.polyLine;
    }

    protected PrepareLineator(points: L.LatLng[][], elevation: number[][]) {
        let roadGroups: RoadGroup[] = [];
        for (let i = 0; i < points.length; i++) {
            roadGroups.push(new RoadGroup(points[i], elevation[i]));
        }
        this.lineator = new Lineator(roadGroups);
    }

    private EngageLineator() {
        this.lineator.Init();
        this.lineator.ExportToSQL(this.id);
    }

    public GetSignificantPoint(): L.LatLng {
        return this.lineator.GetSignificantPoint();
    }

    public override SetupInteractivity(layerID: number) {
        this.polyLine.on("click", (event) => {
            // TODO: Maybe don't let the user spam this, if it is already open?
            if (!this.lineator.CheckInit()) {
                App.Instance.PushAlert(
                    "Pro tuto trasu nebyla vytvořena interní strategie výškového průchodu.",
                    "Vytvořit nyní?",
                    this.EngageLineator.bind(this)
                );
            } else {
                let chartPoints = this.lineator.GenerateChartPoints();
                App.Instance.SetElevationChart(chartPoints[0], chartPoints[1], layerID);
            }
        });
    }
}
