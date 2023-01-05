
export class LocalEntityDB {
    private db: Promise<IDBDatabase>;
    private static dbName: string = "localentitydb";
    private static storeName: string = "localentitystore";
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
            const db = openRequest.result;
            const objectStore = db.createObjectStore(LocalEntityDB.storeName, {
                keyPath: "dbID",
                autoIncrement: false,
            });
            objectStore.createIndex("name", "name", { unique: false });
            console.log("Database setup complete");
        };
    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    public async AddEntity() {
        const testItem = {"name": "something", "dbID": 69};

        // Get DB when ready
        const db = await this.db;
        
        // Transaction and ObjectStore
        const transaction = db.transaction(LocalEntityDB.storeName, "readwrite");
        const objectStore = transaction.objectStore(LocalEntityDB.storeName);

        // The adding of object
        objectStore.put(testItem);

        // Error reporting to console 
        transaction.onerror = (err) => console.error("IndexedDB transaction error:", err);
    }

    public async GetEntity() {
        const db = await this.db;
        const objectStore = db.transaction(LocalEntityDB.storeName).objectStore(LocalEntityDB.storeName);
        const entityRequest = objectStore.get(69);
        entityRequest.onsuccess = () => {
            console.log(entityRequest.result);
        };
    }
}