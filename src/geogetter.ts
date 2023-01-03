import { ApiMgr } from "./apimgr";
import { DBMapEntityCache } from "./dbentitycache";
import { DBOSMMapRoad } from "./dbosmroad";
import { DBSingleMapRoad } from "./dbsingleroad";
import { MapEntityFactory } from "./mapentityfactory";

export class GeoGetter {
    private static GetGenericRails(dbIDs: number[], get: Function, create: Function, check: Function, getStations?: Function) {
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
        let stationCollections: object[] = [];
        if (dbIDsToFetch.length > 0)
        {
            features = get(dbIDsToFetch)["features"];
            if (getStations !== undefined)
                stationCollections = getStations(dbIDsToFetch)["Collections"];
        }
        for (let i = 0; i < dbIDs.length; i++) {
            if (dbIDs[i] === undefined) {
                mapRoads.push(cacheRoads.shift());
            } else { // Not cached
                let newMapRoad;
                // TODO: Optimize
                for (let j = 0; j < features.length; j++) {
                    if (features[j]["properties"]["relcislo"] == dbIDs[i]) {
                        newMapRoad = create(
                            dbIDs[i],
                            features.splice(j, 1)[0]
                        ); 
                        break;
                    }
                }
                for (let j = 0; j < stationCollections.length; j++) {
                    if (stationCollections[j]["properties"]["relcislo"] == dbIDs[i]) {
                        newMapRoad.AddStations(stationCollections.splice(j, 1)[0]);
                        break;
                    }
                }
                mapRoads.push(newMapRoad);
            }
        }

        return mapRoads;
    }

    public static GetRails(dbIDs: number[]): DBSingleMapRoad[] {
        return GeoGetter.GetGenericRails(
            dbIDs,
            ApiMgr.GetRails.bind(ApiMgr),
            MapEntityFactory.CreateDBSingleMapRoad.bind(MapEntityFactory),
            DBMapEntityCache.Instance.CheckDBSingleMapRoad.bind(DBMapEntityCache.Instance),
            ApiMgr.GetStations.bind(ApiMgr)
        );
    }

    public static GetOSMRails(dbIDs: number[]): DBOSMMapRoad[] {
        return GeoGetter.GetGenericRails(
            dbIDs,
            ApiMgr.GetOSMRails.bind(ApiMgr),
            MapEntityFactory.CreateDBOSMMapRoad.bind(MapEntityFactory),
            DBMapEntityCache.Instance.CheckOSMMapRoad.bind(DBMapEntityCache.Instance),
            // ApiMgr.GetStations.bind(ApiMgr) // TODO: Fix API error, then enable
        );
    }
}