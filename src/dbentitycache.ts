import { ApiMgr } from "./apimgr";
import { DBOSMMapRoad } from "./dbosmroad";
import { DBSingleMapRoad } from "./dbsingleroad";
import { DBStationMapMarker } from "./dbstationmarker";

export class DBMapEntityCache {
    private db: Promise<IDBDatabase>;
    private static dbName: string = "localentitydb";
    private static railStore: string = "railStore";
    private static stationStore: string = "stationStore";
    private static supportedBrowser: boolean;
    private static _instance: DBMapEntityCache;

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    private constructor() {
        if (!window.indexedDB) {
            DBMapEntityCache.supportedBrowser = false;
            return;
        } else
            DBMapEntityCache.supportedBrowser = true;

        const openRequest = window.indexedDB.open(DBMapEntityCache.dbName, 1);

        this.db = new Promise((resolve, reject) => {
            openRequest.onsuccess = () => {
                resolve(openRequest.result);
            };
            openRequest.onerror = (err) => {
                console.error(`IndexedDB error: ${openRequest.error}`, err)
                reject(openRequest.error);
            };
        });

        openRequest.onupgradeneeded = () => {
            // Init railStore
            const db = openRequest.result;
            db.createObjectStore(DBMapEntityCache.railStore, {
                keyPath: "properties.relcislo",
                autoIncrement: false,
            });

            // Init stationStore
            db.createObjectStore(DBMapEntityCache.stationStore, {
                keyPath: "properties.relcislo",
                autoIncrement: false,
            });
        };
    }

    private async AddEntity(entity: object, store: string) {
        if (!DBMapEntityCache.supportedBrowser)
            return;

        // Get DB when ready
        const db = await this.db;

        // Transaction and ObjectStore
        const transaction = db.transaction(store, "readwrite");
        const objectStore = transaction.objectStore(store);

        // The adding of object
        objectStore.put(entity);

        // Error reporting to console 
        transaction.onerror = (err) => console.error("IndexedDB transaction error:", err);
    }

    private async CheckEntity(relcislo: number, store: string): Promise<boolean> {
        if (!DBMapEntityCache.supportedBrowser)
            return false;

        const db = await this.db;
        const objectStore = db.transaction(store).objectStore(store);
        const checkRequest = objectStore.count(relcislo);

        return new Promise((resolve, reject) => {
            checkRequest.onsuccess = () => {
                if (checkRequest.result > 0)
                    resolve(true);
                else
                    resolve(false);
            };
            checkRequest.onerror = (err) => {
                console.error(`IndexedDB error: ${checkRequest.error}`, err)
                reject(checkRequest.error);
            };
        });
    }

    private async GetEntity(relcislo: number, store: string): Promise<object> {
        // NOTE: This should not be called unless entity was checked, so not asking for browserSupport

        const db = await this.db;
        const objectStore = db.transaction(store).objectStore(store);
        const entityRequest = objectStore.get(relcislo);

        return new Promise((resolve, reject) => {
            entityRequest.onsuccess = () => {
                resolve(entityRequest.result);
            };
            entityRequest.onerror = (err) => {
                console.error(`IndexedDB error: ${entityRequest.error}`, err)
                reject(entityRequest.error);
            };
        });
    }

    private async ClearAllEntities(store: string): Promise<boolean> {
        if (!DBMapEntityCache.supportedBrowser)
            return;

        const db = await this.db;
        const objectStore = db.transaction(store, "readwrite").objectStore(store);
        const clearRequest = objectStore.clear();

        return new Promise((resolve, reject) => {
            clearRequest.onsuccess = () => {
                resolve(clearRequest.result);
            };
            clearRequest.onerror = (err) => {
                console.error(`IndexedDB error: ${clearRequest.error}`, err)
                reject(clearRequest.error);
            };
        });
    }

    public async ClearRails() {
        this.ClearAllEntities(DBMapEntityCache.railStore);
    }

    public async ClearStations() {
        this.ClearAllEntities(DBMapEntityCache.stationStore);
    }

    public async CheckMapRoad(dbID: number): Promise<boolean> {
        return this.CheckEntity(dbID, DBMapEntityCache.railStore);
    }

    public async GetOSMMapRoads(dbIDs: number[]): Promise<DBOSMMapRoad[]> {
        let fetchStatus: boolean[] = [];
        let remoteIDs: number[] = [];
        let remoteRoads: DBOSMMapRoad[] = [];
        let cachedRoads: DBOSMMapRoad[] = [];
        let allRoads: DBOSMMapRoad[] = [];

        for (const dbID of dbIDs) {
            if (!(await this.CheckMapRoad(dbID))) {
                fetchStatus.push(true);
                remoteIDs.push(dbID);
            }
            else {
                fetchStatus.push(false);
                cachedRoads.push(new DBOSMMapRoad(
                    await this.GetEntity(dbID, DBMapEntityCache.railStore)
                ));
            }
        };

        if (remoteIDs.length > 0) {
            const response = await ApiMgr.GetOSMRails(remoteIDs);
            if (response["status"] != "ok")
                return undefined;
            for (const feature of response["features"]) {
                this.AddEntity(feature, DBMapEntityCache.railStore);
                remoteRoads.push(new DBOSMMapRoad(feature));
            };
        }

        fetchStatus.forEach(fs => {
            if (fs)
                allRoads.push(remoteRoads.shift());
            else
                allRoads.push(cachedRoads.shift());
        });

        return allRoads;
    }

    public async GetSingleMapRoads(dbIDs: number[]) {
        let fetchStatus: boolean[] = [];
        let remoteIDs: number[] = [];
        let remoteRoads: DBSingleMapRoad[] = [];
        let cachedRoads: DBSingleMapRoad[] = [];
        let allRoads: DBSingleMapRoad[] = [];

        for (const dbID of dbIDs) {
            if (!(await this.CheckMapRoad(dbID))) {
                fetchStatus.push(true);
                remoteIDs.push(dbID);
            }
            else {
                fetchStatus.push(false);
                const entity = await this.GetEntity(dbID, DBMapEntityCache.railStore);
                cachedRoads.push(new DBSingleMapRoad(
                   entity 
                ));
            }
        };

        if (remoteIDs.length > 0) {
            const response = await ApiMgr.GetRails(remoteIDs);
            if (response["status"] != "ok")
                return undefined;
            for (const feature of response["features"]) {
                this.AddEntity(feature, DBMapEntityCache.railStore);
                remoteRoads.push(new DBSingleMapRoad(feature));
            };
        }

        const stations = await this.GetDBStationMapMarkers(dbIDs);

        fetchStatus.forEach(fs => {
            let road: DBSingleMapRoad;
            if (fs)
                road = remoteRoads.shift();
            else
                road = cachedRoads.shift();

            road.AddStations(stations.shift());
            allRoads.push(road);
        });

        return allRoads;
    }

    public async CheckDBStationMapMarkers(dbID: number): Promise<boolean> {
        return await this.CheckEntity(dbID, DBMapEntityCache.stationStore);
    }

    public async GetDBStationMapMarkers(dbIDs: number[]): Promise<DBStationMapMarker[][]> {
        let fetchStatus: boolean[] = [];
        let remoteIDs: number[] = [];
        let remoteStations: DBStationMapMarker[][] = [];
        let cachedStations: DBStationMapMarker[][] = [];
        let allStations: DBStationMapMarker[][] = [];

        for (const dbID of dbIDs) {
            if (!(await this.CheckDBStationMapMarkers(dbID))) {
                fetchStatus.push(true);
                remoteIDs.push(dbID);
            }
            else {
                fetchStatus.push(false);
                const geoJSON = await this.GetEntity(dbID, DBMapEntityCache.stationStore);
                cachedStations.push(geoJSON["features"].map((sf) => {
                    return new DBStationMapMarker(sf);
                }));
            }
        };

        if (remoteIDs.length > 0) {
            const response = await ApiMgr.GetStations(remoteIDs);
            if (response["status"] != "ok")
                return undefined;
            for (const collection of response["Collections"]) {
                this.AddEntity(collection, DBMapEntityCache.stationStore);
                remoteStations.push(collection["features"].map((sf) => {
                    return new DBStationMapMarker(sf);
                }));
            };
        }

        fetchStatus.forEach(fs => {
            if (fs)
                allStations.push(remoteStations.shift());
            else
                allStations.push(cachedStations.shift());
        });

        return allStations;
    }
}