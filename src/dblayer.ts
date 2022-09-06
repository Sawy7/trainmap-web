import { MapLayer } from "./maplayer";

export class DBMapLayer extends MapLayer {
    readonly className: string = "DBMapLayer";

    public constructor(name: string) {
        super(name);
    }

    public SaveToLocalStorage() {
        let storageList = [];

        if (localStorage["dblayers"] !== undefined)
            storageList = JSON.parse(localStorage["dblayers"]);

        let layerIDs: number[] = [];
        this.layerEntities.forEach(e => {
            if (e.dbID === undefined)
                return;
            
            layerIDs.push(e.dbID);
        });
        
        storageList.push({
            "name": this.layerName,
            "ids": layerIDs
        });
        localStorage["dblayers"] = JSON.stringify(storageList);
    }
}