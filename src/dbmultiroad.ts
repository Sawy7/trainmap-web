import L from "leaflet";
import { ApiMgr } from "./apimgr";
import { App } from "./app";
import { DBMapEntity } from "./dbmapentity";
import { Helper } from "./helper";
import { Lineator } from "./lineator";
import { LogNotify } from "./lognotify";
import { MultiMapRoad } from "./multiroad";
import { RoadGroup } from "./roadgroup";

export class DBMultiMapRoad extends MultiMapRoad {
    readonly className: string;

    private static ParseGeoJSON(geoJSON: object): [L.LatLng[][], number[][]] {
        let lineStrings = geoJSON["geometry"]["coordinates"];
        let mlPoints: L.LatLng[][] = [];
        let mlElevation: number[][] = [];
        lineStrings.forEach(ls => {
            let lsPoints: L.LatLng[] = [];
            let lsElevation: number[] = [];
            ls.forEach(coords => {
                lsPoints.push(new L.LatLng(coords[1], coords[0]));
                lsElevation.push(coords[2]);
            });
            mlPoints.push(lsPoints);
            mlElevation.push(lsElevation);
        });

        return [mlPoints, mlElevation];
    }

    public constructor(dbID: number) {
        let geoJSON = ApiMgr.GetElement(dbID);

        if (geoJSON["status"] !== "ok") {
            super([], [], "");
            this.wasRemoved = true;
            this.className = "DBMultiMapRoad";
            return;
        }
        
        let type = geoJSON["geometry"]["type"];
        if (type == "MultiLineString") {
            let mlPoints: L.LatLng[][] = [];
            let mlElevation: number[][] = [];
            [mlPoints, mlElevation] = DBMultiMapRoad.ParseGeoJSON(geoJSON);

            super(
                [], [], geoJSON["properties"]["name"],
                geoJSON["properties"]["color"], geoJSON["properties"]["weight"],
                geoJSON["properties"]["opacity"], geoJSON["properties"]["smoothFactor"]
            );
            
            this.wasRemoved = false;
            this.className = "DBMultiMapRoad";
            this.dbID = dbID;
            this.PrepareLineator(mlPoints, mlElevation);
        } else {
            console.log("Unknown feature type!")
        }
    }

    protected PrepareLineator(points: L.LatLng[][], elevation: number[][]) {
        // In case of removed DB road
        if (this.dbID === undefined)
            return;
        
        let gidList = ApiMgr.GetGIDs(this.dbID);
        let roadGroups: RoadGroup[] = [];
        for (let i = 0; i < points.length; i++) {
            roadGroups.push(new RoadGroup(points[i], elevation[i], gidList["gids"][i]));
        }
        this.lineator = new Lineator(roadGroups);
        this.InsertDBLineatorHierarchy();
    }

    public InsertDBLineatorHierarchy() {
        this.lineator.InsertDBHierarchy(this.dbID);
    }

    protected SetElevationChartFromLineator() {
        super.SetElevationChartFromLineator();

        if (this.lineator.CheckFromDB())
            return;
        
        LogNotify.PushAlert(
            "Tato strategie není součástí globální databáze.",
            "Stáhnout SQL skript?",
            this.ExportLineatorToSQL.bind(this),
            "success"
        );
    }

    private ExportLineatorToSQL() {
        let text = this.lineator.ExportToSQL(this.dbID);
        App.Instance.SaveTextToDisk(text, "strategie.sql", "text/sql");
    }
}
export interface DBMultiMapRoad extends DBMapEntity {};
Helper.applyMixins(DBMultiMapRoad, [DBMapEntity]);
