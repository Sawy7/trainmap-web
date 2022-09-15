import L from "leaflet";
import { DBMapLayer } from "./dblayer";
import { DBMultiMapRoad } from "./dbmultiroad";
import { DBSingleMapRoad } from "./dbsingleroad";
import { LogNotify } from "./lognotify";
import { MapEntityFactory } from "./mapentityfactory";

export class GhostDBMapLayer extends DBMapLayer {
    private initialized: boolean = false;
    private populationMethod: Function;
    private collapseElement: HTMLElement;
    private elementInfoObjects: object[];

    public constructor(name: string, elementInfoObjects: object[], color?: string) {
        super(name, color);
        this.elementInfoObjects = elementInfoObjects;
    }
    
    public async GetLayerGroup(): Promise<L.LayerGroup> {
        // Download the thing before displaying
        if (!this.initialized) {
            let loader = LogNotify.PlaceLoader(
                this.collapseElement.previousElementSibling.getElementsByTagName("span")[0].childNodes[0] as HTMLElement,
                true
            );

            return new Promise((resolve) => {
                // TODO: Is setTimeout neccessary?
                setTimeout(() => {
                    this.DownloadLayer();
                    loader.parentNode.removeChild(loader);
                    this.initialized = true;
                    resolve(super.GetLayerGroup());
                }, 0);
            });
        }
        
        return new Promise((resolve) => {
            // TODO: Is setTimeout neccessary?
            setTimeout(() => {
                resolve(super.GetLayerGroup());
            }, 0);
        });
    }

    private async DownloadLayer() {
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