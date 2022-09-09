import L from "leaflet";
import { Lineator } from "./lineator";
import { MapRoad } from "./maproad";
import { RoadGroup } from "./roadgroup";
import { App } from "./app";
import { LogNotify } from "./lognotify";

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
                dbID: number = undefined
    ) {
        super(name, color, weight, opacity, smoothFactor, dbID);
        this.dontSerializeList.push("lineator");
        
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
        LogNotify.ToggleThrobber();
        setTimeout(() => {
            this.lineator.Init();
            LogNotify.ToggleThrobber();

            this.SetElevationChartFromLineator();

            // Don't create SQL script if not in DB (no id) - TODO: move
            if (this.dbID === undefined)
                return;
    
            LogNotify.PushAlert(
                "Tato strategie není součástí globální databáze.",
                "Stáhnout SQL skript?",
                this.ExportLineatorToSQL.bind(this),
                "success"
            );
        }, 0);
    }

    public GetSignificantPoint(): L.LatLng {
        return this.lineator.GetSignificantPoint();
    }

    private ExportLineatorToSQL() {
        let text = this.lineator.ExportToSQL(this.dbID);
        App.Instance.SaveTextToDisk(text, "strategie.sql", "text/sql");
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

    private SetElevationChartFromLineator() {
        let chartPoints = this.lineator.GenerateChartPoints();
        App.Instance.SetElevationChart(chartPoints[0], chartPoints[1], this.layerID);
    }
}
