import { ApiMgr } from "./apimgr";
import { DBMapEntityCache } from "./dbentitycache";
import { DBOSMMapRoad } from "./dbosmroad";
import { DBSingleMapRoad } from "./dbsingleroad";
import { MapEntityFactory } from "./mapentityfactory";

export class GeoGetter {
    private static async GetGenericRails(
        dbIDs: number[], get: Function, create: Function, check: Function,
        getStations?: Function, createStations?: Function
    ) {
        if (dbIDs.length == 0)
            return [];

        let mapRoads: any[] = [];
        let cacheRoads: any[] = [];

        // First check cache
        let dbIDsToFetch: number[] = [];
        for (let i = 0; i < dbIDs.length; i++) {
            if (await check(dbIDs[i])) {
                cacheRoads.push(
                    await create(dbIDs[i])
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
            let response = await get(dbIDsToFetch);
            if (response["status"] != "ok")
                return undefined;
            features = response["features"];
            if (getStations !== undefined)
                stationCollections = getStations(dbIDsToFetch)["Collections"];
        }
        for (let i = 0; i < dbIDs.length; i++) {
            if (dbIDs[i] === undefined) {
                let lastCacheRoad = cacheRoads.shift();
                if (getStations !== undefined)
                    lastCacheRoad.AddStations(await createStations(lastCacheRoad.dbID));
                mapRoads.push(lastCacheRoad);
            } else { // Not cached
                let newMapRoad;
                // TODO: Optimize
                for (let j = 0; j < features.length; j++) {
                    if (features[j]["properties"]["relcislo"] == dbIDs[i]) {
                        newMapRoad = await create(
                            dbIDs[i],
                            features.splice(j, 1)[0]
                        ); 
                        break;
                    }
                }
                for (let j = 0; j < stationCollections.length; j++) {
                    if (stationCollections[j]["properties"]["relcislo"] == dbIDs[i]) {
                        let geoJSON = stationCollections.splice(j, 1)[0];
                        newMapRoad.AddStations(
                            await createStations(dbIDs[i], geoJSON)
                        );
                        break;
                    }
                }
                mapRoads.push(newMapRoad);
            }
        }

        return mapRoads;
    }

    public static async GetRails(dbIDs: number[]): Promise<DBSingleMapRoad[]> {
        return await GeoGetter.GetGenericRails(
            dbIDs,
            ApiMgr.GetRails.bind(ApiMgr),
            MapEntityFactory.CreateDBSingleMapRoad.bind(MapEntityFactory),
            DBMapEntityCache.Instance.CheckDBSingleMapRoad.bind(DBMapEntityCache.Instance),
            ApiMgr.GetStations.bind(ApiMgr),
            MapEntityFactory.CreateDBStationMapMarkers.bind(MapEntityFactory)
        );
    }

    public static async GetOSMRails(dbIDs: number[]): Promise<DBOSMMapRoad[]> {
        return await GeoGetter.GetGenericRails(
            dbIDs,
            ApiMgr.GetOSMRails.bind(ApiMgr),
            MapEntityFactory.CreateDBOSMMapRoad.bind(MapEntityFactory),
            DBMapEntityCache.Instance.CheckOSMMapRoad.bind(DBMapEntityCache.Instance),
            // ApiMgr.GetStations.bind(ApiMgr) // TODO: Fix API error, then enable
        );
    }
}