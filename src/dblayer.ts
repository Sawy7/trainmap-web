import { DBMapEntity } from "./dbmapentity";
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

        let layerElements: object[] = [];
        this.layerEntities.forEach(e => {
            // if (!(e instanceof DBMultiMapRoad) && !(e instanceof DBSingleMapRoad))
            //     return;

            layerElements.push((e as DBMapEntity).GetLocalStorageObject());
        });
        
        storageList.push({
            "name": this.layerName,
            "elements": layerElements
        });
        localStorage["dblayers"] = JSON.stringify(storageList);
    }
}