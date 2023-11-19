import { LatLng } from "leaflet";
import { DBMapEntityCache } from "./dbentitycache";
import { DBMapLayer } from "./dblayer";
import { DBOSMMapRoad } from "./dbosmroad";
import { DBSingleMapRoad } from "./dbsingleroad";
import { GhostDBMapLayer } from "./ghostdblayer";
import { MapArea } from "./maparea";
import { MapLayer } from "./maplayer"
import { MapMarker } from "./mapmarker";
import { MultiMapRoad } from "./multiroad";
import { SingleMapRoad } from "./singleroad";
import { DBStationMapMarker } from "./dbstationmarker";
import { ApiMgr } from "./apimgr";

export class MapEntityFactory {
    // Layers
    public static CreateMapLayer(name: string, color?: string): MapLayer {
        return new MapLayer(name, color);
    }

    public static CreateDBMapLayer(name: string, color?: string): DBMapLayer {
        return new DBMapLayer(name, color);
    }

    public static CreateGhostDBMapLayer(name: string, elementInfoObjects: object[], color: string, id: number): DBMapLayer {
        return new GhostDBMapLayer(name, elementInfoObjects, color, id);
    }

    // Roads
    public static CreateSingleMapRoad(
        points: LatLng[], elevation: number[],
        name?: string
    ): SingleMapRoad {
        return new SingleMapRoad(points, elevation, name);
    }

    public static CreateMultiMapRoad(
        points: LatLng[][], elevation: number[][],
        name?: string
    ): MultiMapRoad {
        return new MultiMapRoad(points, elevation, name);
    }

    private static async CreateGenericDBRoads(
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

    public static async CreateDBOSMMapRoad(dbID: number, geoJSON?: object): Promise<DBOSMMapRoad> {
        return DBMapEntityCache.Instance.GetOSMMapRoad(dbID, geoJSON);
    }

    public static async CreateDBOSMMapRoads(dbIDs: number[]): Promise<DBOSMMapRoad[]> {
        return await MapEntityFactory.CreateGenericDBRoads(
            dbIDs,
            ApiMgr.GetOSMRails.bind(ApiMgr),
            MapEntityFactory.CreateDBOSMMapRoad.bind(MapEntityFactory),
            DBMapEntityCache.Instance.CheckOSMMapRoad.bind(DBMapEntityCache.Instance),
            // ApiMgr.GetStations.bind(ApiMgr) // TODO: Fix API error, then enable
        );
    }

    // NOTE: This gets just the MapRoad -- to get stations use the next function
    public static async CreateDBSingleMapRoad(dbID: number, geoJSON?: object): Promise<DBSingleMapRoad> {
        return DBMapEntityCache.Instance.GetDBSingleMapRoad(dbID, geoJSON);
    }

    public static async CreateDBSingleMapRoads(dbIDs: number[]): Promise<DBSingleMapRoad[]> {
        return await MapEntityFactory.CreateGenericDBRoads(
            dbIDs,
            ApiMgr.GetRails.bind(ApiMgr),
            MapEntityFactory.CreateDBSingleMapRoad.bind(MapEntityFactory),
            DBMapEntityCache.Instance.CheckDBSingleMapRoad.bind(DBMapEntityCache.Instance),
            ApiMgr.GetStations.bind(ApiMgr),
            MapEntityFactory.CreateDBStationMapMarkers.bind(MapEntityFactory)
        );
    }

    // Markers
    public static CreateMapMarker(
        point: L.LatLng,
        popupMsg: string,
        name: string = "Bod",
        customIcon?: string,
        customIconSize?: number
    ): MapMarker {
        return new MapMarker(point, popupMsg, name, customIcon, customIconSize);
    }

    public static CreateElevationMarker(point: L.LatLng): MapMarker {
        return new MapMarker(point, "", "", "custom-assets/elevation-marker.svg", 14)
    }

    public static async CreateDBStationMapMarkers(dbID: number, geoJSON?: object): Promise<DBStationMapMarker[]> {
        return DBMapEntityCache.Instance.GetDBStationMapMarkers(dbID, geoJSON);
    }

    // Areas
    public static CreateMapArea(
        points: L.LatLng[],
        popupMsg: string,
        name: string = "Plocha",
        dbID: number = undefined
    ): MapArea {
        return new MapArea(points, popupMsg, name);
    }
}