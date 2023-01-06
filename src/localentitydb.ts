import { geoJSON } from "leaflet";

export class LocalEntityDB {
    private db: Promise<IDBDatabase>;
    private static dbName: string = "localentitydb";
    private static railStore: string = "railStore";
    private static stationStore: string = "stationStore";
    private static _instance: LocalEntityDB;

    private constructor(){
        const openRequest = window.indexedDB.open(LocalEntityDB.dbName, 1);

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
            db.createObjectStore(LocalEntityDB.railStore, {
                keyPath: "properties.relcislo",
                autoIncrement: false,
            });

            // Init stationStore
            db.createObjectStore(LocalEntityDB.stationStore, {
                keyPath: "properties.relcislo",
                autoIncrement: false,
            });
        };

    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    private async AddEntity(entity: object, store: string) {
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

    public async AddRail(rail: object) {
        this.AddEntity(rail, LocalEntityDB.railStore);
    }

    public async AddStations(stations: object) {
        this.AddEntity(stations, LocalEntityDB.stationStore);
    }

    public async CheckEntity(relcislo: number, store: string): Promise<boolean> {
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

    public async CheckRail(relcislo: number): Promise<boolean> {
        return this.CheckEntity(relcislo, LocalEntityDB.railStore);
    }

    public async CheckStations(relcislo: number): Promise<boolean> {
        return this.CheckEntity(relcislo, LocalEntityDB.stationStore);
    }

    private async GetEntity(relcislo: number, store: string): Promise<object> {
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

    public async GetRail(relcislo: number): Promise<object> {
        return this.GetEntity(relcislo, LocalEntityDB.railStore);
    }

    public async GetStations(relcislo: number): Promise<object> {
        return this.GetEntity(relcislo, LocalEntityDB.stationStore);
    }

    private async ClearAllEntities(store: string): Promise<boolean> {
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
        this.ClearAllEntities(LocalEntityDB.railStore);
    }

    public async ClearStations() {
        this.ClearAllEntities(LocalEntityDB.stationStore);
    }

    // public async GetAllEntities(): Promise<object[]> {
    //     const db = await this.db;
    //     const objectStore = db.transaction(LocalEntityDB.storeName).objectStore(LocalEntityDB.storeName);
    //     const entityRequest = objectStore.getAll();

    //     return new Promise((resolve, reject) => {
    //         entityRequest.onsuccess = () => {
    //             resolve(entityRequest.result);
    //         };
    //         entityRequest.onerror = (err) => {
    //             console.error(`IndexedDB error: ${entityRequest.error}`, err)
    //             reject(entityRequest.error);
    //         };
    //     });
    // }
}
