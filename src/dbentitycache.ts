import { DBMultiMapRoad } from "./dbmultiroad";
import { DBOSMMapRoad } from "./dbosmroad";
import { DBSingleMapRoad } from "./dbsingleroad";

export class DBMapEntityCache {
    private DBMultiMapRoadCache: object = {};
    private DBOSMMapRoadCache: object = {};
    private DBSingleMapRoadCache: object = {};
    private static _instance: DBMapEntityCache;

    private constructor(){};

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    public CheckDBMultiMapRoad(dbID: number): boolean {
        if (this.DBMultiMapRoadCache[dbID] === undefined)
            return false;
        return true;
    }

    public GetDBMultiMapRoad(dbID: number, geoJSON?: object): DBMultiMapRoad {
        if (!this.CheckDBMultiMapRoad(dbID))
            this.DBMultiMapRoadCache[dbID] = new DBMultiMapRoad(dbID, geoJSON);

        return this.DBMultiMapRoadCache[dbID];
    }

    public CheckOSMMapRoad(dbID: number): boolean {
        if (this.DBOSMMapRoadCache[dbID] === undefined)
            return false;
        return true;
    }

    public GetOSMMapRoad(dbID: number, geoJSON?: object): DBOSMMapRoad {
        if (!this.CheckOSMMapRoad(dbID))
            this.DBOSMMapRoadCache[dbID] = new DBOSMMapRoad(dbID, geoJSON);

        return this.DBOSMMapRoadCache[dbID];
    }

    public CheckDBSingleMapRoad(dbID: number): boolean {
        if (this.DBSingleMapRoadCache[dbID] === undefined)
            return false;
        return true;
    }

    public GetDBSingleMapRoad(dbID: number, geoJSON?: object): DBSingleMapRoad {
        if (!this.CheckDBSingleMapRoad(dbID))
            this.DBSingleMapRoadCache[dbID] = new DBSingleMapRoad(dbID, geoJSON);

        return this.DBSingleMapRoadCache[dbID];
    }
}