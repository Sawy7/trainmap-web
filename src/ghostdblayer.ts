import L from "leaflet";
import { DBMapLayer } from "./dblayer";
import { GeoGetter } from "./geogetter";
import { LogNotify } from "./lognotify";

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
        let dbRails: number[] = [];
        let dbElements: number[] = [];
        let dbOSMRails: number[] = [];

        this.elementInfoObjects.forEach(e => {
            if (e["type"] == "DBMultiMapRoad")
                dbElements.push(e["id"]);
            else if (e["type"] == "DBSingleMapRoad")
                dbRails.push(e["id"]);
            else if (e["type"] == "DBOSMMapRoad")
                dbOSMRails.push(e["id"]);
        });

        // TODO: Removal check - Something more elegant (+ maybe user indication, that something's been yeeted)

        GeoGetter.GetRails(dbRails).forEach(road => {
            if (!road.CheckRemoved())
                this.AddMapRoad(road);
        });
        GeoGetter.GetElements(dbElements).forEach(road => {
            if (!road.CheckRemoved())
                this.AddMapRoad(road);
        });
        GeoGetter.GetOSMRails(dbOSMRails).forEach(road => {
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