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

    public GetDBMultiMapRoad(dbID: number): DBMultiMapRoad {
        if (this.DBMultiMapRoadCache[dbID] === undefined)
            this.DBMultiMapRoadCache[dbID] = new DBMultiMapRoad(dbID);

        return this.DBMultiMapRoadCache[dbID];
    }

    public GetOSMMapRoad(dbID: number, geoJSON?: object): DBOSMMapRoad {
        if (this.DBOSMMapRoadCache[dbID] === undefined)
            this.DBOSMMapRoadCache[dbID] = new DBOSMMapRoad(dbID, geoJSON);

        return this.DBOSMMapRoadCache[dbID];
    }

    public GetDBSingleMapRoad(dbID: number): DBSingleMapRoad {
        if (this.DBSingleMapRoadCache[dbID] === undefined)
            this.DBSingleMapRoadCache[dbID] = new DBSingleMapRoad(dbID);

        return this.DBSingleMapRoadCache[dbID];
    }
}