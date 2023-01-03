import { DBMapEntity } from "./dbmapentity";
import { DBOSMMapRoad } from "./dbosmroad";
import { DBSingleMapRoad } from "./dbsingleroad";
import { MapLayer } from "./maplayer";

export class DBMapLayer extends MapLayer {
    readonly className: string = "DBMapLayer";

    public constructor(name: string, color?: string) {
        super(name, color);
    }

    public SaveToLocalStorage() {
        let storageList = [];

        if (localStorage["dblayers"] !== undefined)
            storageList = JSON.parse(localStorage["dblayers"]);

        let layerElements: object[] = [];
        this.layerEntities.forEach(e => {
            if (!(e instanceof DBSingleMapRoad) && !(e instanceof DBOSMMapRoad))
                return;

            layerElements.push((e as DBMapEntity).GetLocalStorageObject());
        });
        
        storageList.push({
            "name": this.layerName,
            "color": this.layerColor,
            "elements": layerElements
        });
        localStorage["dblayers"] = JSON.stringify(storageList);
    }
}