import { ApiMgr } from "./apimgr";
import { DBMapEntityCache } from "./dbentitycache";
import { DBOSMMapRoad } from "./dbosmroad";
import { DBSingleMapRoad } from "./dbsingleroad";
import { MapEntityFactory } from "./mapentityfactory";

export class GeoGetter {
    private static GetGeneric(dbIDs: number[], get: Function, create: Function, check: Function) {
        if (dbIDs.length == 0)
            return [];

        let mapRoads: any[] = [];
        let cacheRoads: any[] = [];

        // First check cache
        let dbIDsToFetch: number[] = [];
        for (let i = 0; i < dbIDs.length; i++) {
            if (check(dbIDs[i])) {
                cacheRoads.push(
                    create(dbIDs[i])
                );
                dbIDs[i] = undefined;
            }
            else
                dbIDsToFetch.push(dbIDs[i]);
        }

        let features: object[] = [];
        if (dbIDsToFetch.length > 0)
            features = get(dbIDsToFetch)["features"];
        for (let i = 0; i < dbIDs.length; i++) {
            if (dbIDs[i] === undefined) {
                mapRoads.push(cacheRoads.shift());
            } else {
                mapRoads.push(create(
                    dbIDs[i],
                    features.shift()
                ));
            }
        }

        return mapRoads;
    }

    public static GetRails(dbIDs: number[]): DBSingleMapRoad[] {
        return GeoGetter.GetGeneric(
            dbIDs,
            ApiMgr.GetRails.bind(ApiMgr),
            MapEntityFactory.CreateDBSingleMapRoad.bind(MapEntityFactory),
            DBMapEntityCache.Instance.CheckDBSingleMapRoad.bind(DBMapEntityCache.Instance)
        );
    }

    public static GetOSMRails(dbIDs: number[]): DBOSMMapRoad[] {
        return GeoGetter.GetGeneric(
            dbIDs,
            ApiMgr.GetOSMRails.bind(ApiMgr),
            MapEntityFactory.CreateDBOSMMapRoad.bind(MapEntityFactory),
            DBMapEntityCache.Instance.CheckOSMMapRoad.bind(DBMapEntityCache.Instance)
        );
    }
}