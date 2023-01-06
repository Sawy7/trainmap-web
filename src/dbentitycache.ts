import { ApiMgr } from "./apimgr";
import { DBOSMMapRoad } from "./dbosmroad";
import { DBSingleMapRoad } from "./dbsingleroad";
import { DBStationMapMarker } from "./dbstationmarker";
import { LocalEntityDB } from "./localentitydb";

export class DBMapEntityCache {
    private static _instance: DBMapEntityCache;

    private constructor(){};

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    public async CheckOSMMapRoad(dbID: number): Promise<boolean> {
        return await LocalEntityDB.Instance.CheckRail(dbID);
    }

    public async GetOSMMapRoad(dbID: number, geoJSON?: object): Promise<DBOSMMapRoad> {
        if (!(await this.CheckOSMMapRoad(dbID))) {
            if (geoJSON === undefined)
                geoJSON = ApiMgr.GetOSMRails([dbID]);
            
            // NOTE: DB intercept here
            LocalEntityDB.Instance.AddRail(geoJSON);

            return new DBOSMMapRoad(geoJSON);
        }

        return new DBOSMMapRoad(
            await LocalEntityDB.Instance.GetRail(dbID)
        );
    }

    public async CheckDBSingleMapRoad(dbID: number): Promise<boolean> {
        return await LocalEntityDB.Instance.CheckRail(dbID);
    }

    public async GetDBSingleMapRoad(dbID: number, geoJSON?: object): Promise<DBSingleMapRoad> {
        if (!(await this.CheckDBSingleMapRoad(dbID))) {
            if (geoJSON === undefined)
                geoJSON = ApiMgr.GetRails([dbID]);

            // NOTE: DB intercept here
            LocalEntityDB.Instance.AddRail(geoJSON);

            return new DBSingleMapRoad(geoJSON);
        }

        return new DBSingleMapRoad(
            await LocalEntityDB.Instance.GetRail(dbID)
        );
    }

    public async CheckDBStationMapMarkers(dbID: number): Promise<boolean> {
        return await LocalEntityDB.Instance.CheckStations(dbID);
    }

    public async GetDBStationMapMarkers(dbID: number, geoJSON?: object): Promise<DBStationMapMarker[]> {
        if (!(await this.CheckDBStationMapMarkers(dbID))) {
            if (geoJSON === undefined)
                geoJSON = ApiMgr.GetStations([dbID])["Collections"][0];

            // NOTE: DB intercept here
            LocalEntityDB.Instance.AddStations(geoJSON);
        } else {
            geoJSON = await LocalEntityDB.Instance.GetStations(dbID);
        }

        return geoJSON["features"].map((sf) => {
            return new DBStationMapMarker(sf);
        });
    }
}