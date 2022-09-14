import { DBMultiMapRoad } from "./dbmultiroad";
import { DBSingleMapRoad } from "./dbsingleroad";

export class DBMapEntityCache {
    private DBMultiMapRoadCache: object = {};
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

    public GetDBSingleMapRoad(dbID: number): DBSingleMapRoad {
        if (this.DBSingleMapRoadCache[dbID] === undefined)
            this.DBSingleMapRoadCache[dbID] = new DBSingleMapRoad(dbID);

        return this.DBSingleMapRoadCache[dbID];
    }
}