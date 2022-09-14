import L from "leaflet";
import { DBMapLayer } from "./dblayer";
import { DBMultiMapRoad } from "./dbmultiroad";
import { DBSingleMapRoad } from "./dbsingleroad";
import { MapEntityFactory } from "./mapentityfactory";

export class GhostDBMapLayer extends DBMapLayer {
    private initialized: boolean = false;
    private populationMethod: Function;
    private collapseElement: HTMLElement;
    private elementInfoObjects: object[];

    public constructor(name: string, elementInfoObjects: object[]) {
        super(name);
        this.elementInfoObjects = elementInfoObjects;
    }
    
    public GetLayerGroup(): L.LayerGroup {
        // Download the thing before displaying
        this.DownloadLayer();

        return super.GetLayerGroup();
    }

    private DownloadLayer() {
        this.elementInfoObjects.forEach(e => {
            let road: DBSingleMapRoad | DBMultiMapRoad;
            if (e["type"] == "DBMultiMapRoad")
                road = MapEntityFactory.CreateDBMultiMapRoad(e["id"]);
            else if (e["type"] == "DBSingleMapRoad")
                road = MapEntityFactory.CreateDBSingleMapRoad(e["id"]);

            // TODO: Something more elegant (+ maybe user indication, that something's been yeeted)
            if (!road.CheckRemoved())
                this.AddMapRoad(road);
        });
        this.populationMethod(this, this.collapseElement);
    }

    public PassPopulationMethod(populationMethod: Function, collapseElement: HTMLElement) {
        this.populationMethod = populationMethod;
        this.collapseElement = collapseElement;
    }

    public SaveToLocalStorage() {
        if (this.initialized)
            super.SaveToLocalStorage();
        else
            console.log("Not expected: trying to save ghost layer");
    }
}