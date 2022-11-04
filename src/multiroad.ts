import L from "leaflet";
import { Lineator } from "./lineator";
import { MapRoad } from "./maproad";
import { RoadGroup } from "./roadgroup";
import { App } from "./app";
import { LogNotify } from "./lognotify";

export class MultiMapRoad extends MapRoad {
    public lineator: Lineator;
    readonly className: string = "MultiMapRoad";
    private sourceType: string;

    public constructor(
        points: L.LatLng[][],
        elevation: number[][],
        name: string = "Cesta",
        color: string = "red",
        weight: number = 5,
        opacity: number = 0.5,
        smoothFactor: number = 1
    ) {
        super(name, color, weight, opacity, smoothFactor);
        this.dontSerializeList.push("lineator");
        
        this.PrepareLineator(points, elevation);
    }

    public GetMapEntity(): any {
        this.polyLine = new L.Polyline(this.lineator.GetPoints(), {
            color: this.color,
            weight: this.weight,
            opacity: this.opacity,
            smoothFactor: this.smoothFactor
        });
        return this.polyLine;
    }

    public SetSourceType(type: string) {
        this.sourceType = type;
    }

    public GetSourceType(): string {
        return this.sourceType;
    }

    protected PrepareLineator(points: L.LatLng[][], elevation: number[][]) {
        let roadGroups: RoadGroup[] = [];
        for (let i = 0; i < points.length; i++) {
            roadGroups.push(new RoadGroup(points[i], elevation[i]));
        }
        this.lineator = new Lineator(roadGroups);
    }

    private EngageLineator() {
        LogNotify.ToggleThrobber();
        setTimeout(() => {
            this.lineator.Init();
            LogNotify.ToggleThrobber();

            this.SetElevationChartFromLineator();
        }, 0);
    }

    public GetSignificantPoint(): L.LatLng {
        return this.lineator.GetSignificantPoint();
    }

    protected ClickSetElevationChart(event: L.LeafletEvent): L.LeafletMouseEventHandlerFn {
        // TODO: Maybe don't let the user spam this, if it is already open?
        if (!this.lineator.CheckInit()) {
            LogNotify.PushAlert(
                "Pro tuto trasu nebyla vytvořena interní strategie výškového průchodu.",
                "Vytvořit nyní?",
                this.EngageLineator.bind(this)
            );
        } else {
            this.SetElevationChartFromLineator();
        }
        return;
    }

    protected SetElevationChartFromLineator() {
        let chartPoints = this.lineator.GenerateChartPoints();
        App.Instance.SetElevationChart(chartPoints[0], chartPoints[1], this.layerID);
    }
}
