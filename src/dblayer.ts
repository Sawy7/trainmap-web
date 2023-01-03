import { DBMapEntity } from "./dbmapentity";
import { DBOSMMapRoad } from "./dbosmroad";
import { DBSingleMapRoad } from "./dbsingleroad";
import { MapLayer } from "./maplayer";

export class DBMapLayer extends MapLayer {
    readonly className: string = "DBMapLayer";

    public constructor(name: string, color: string, id?: number) {
        super(name, color, id);
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
            "id": this.id,
            "name": this.layerName,
            "color": this.layerColor,
            "elements": layerElements,
        });
        localStorage["dblayers"] = JSON.stringify(storageList);
    }

    public RemoveFromLocalStorage() {
        let storageList = JSON.parse(localStorage["dblayers"]);

        for (let i = 0; i < storageList.length; i++) {
            if (storageList[i]["id"] == this.id) {
                storageList.splice(i, 1);
                break;
            }
        }

        localStorage["dblayers"] = JSON.stringify(storageList);
    }
}