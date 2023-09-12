import L from "leaflet";
import { DBMapLayer } from "./dblayer";
import { LogNotify } from "./lognotify";
import { MapEntityFactory } from "./mapentityfactory";

export class GhostDBMapLayer extends DBMapLayer {
    private initialized: boolean = false;
    private populationMethod: Function;
    private collapseElement: HTMLElement;
    private elementInfoObjects: object[];
    readonly className: string = "GhostDBMapLayer";

    public constructor(name: string, elementInfoObjects: object[], color: string, id: number) {
        super(name, color, id);
        this.elementInfoObjects = elementInfoObjects;
    }
    
    public async GetLayerGroup(): Promise<L.LayerGroup> {
        // Download the thing before displaying
        if (!this.initialized) {
            let loader = LogNotify.PlaceLoader(
                this.collapseElement.previousElementSibling.getElementsByTagName("span")[0].childNodes[0] as HTMLElement,
                true
            );

            await this.DownloadLayer();
            return new Promise((resolve) => {
                loader.parentNode.removeChild(loader);
                this.initialized = true;
                resolve(super.GetLayerGroup());
            });
        }
        
        return new Promise((resolve) => {
            resolve(super.GetLayerGroup());
        });
    }

    private async DownloadLayer() {
        let dbRails: number[] = [];
        let dbOSMRails: number[] = [];

        this.elementInfoObjects.forEach(e => {
            if (e["type"] == "DBSingleMapRoad")
                dbRails.push(e["id"]);
            else if (e["type"] == "DBOSMMapRoad")
                dbOSMRails.push(e["id"]);
        });

        // TODO: Removal check - Something more elegant (+ maybe user indication, that something's been yeeted)

        let fetchedRails = await MapEntityFactory.CreateDBSingleMapRoads(dbRails);
        fetchedRails.forEach(road => {
            if (!road.CheckRemoved()) {
                this.AddMapRoads(road);
                this.AddMapMarkers(...road.GetAdjacentMapEntities());
            }
        });
        let fetchedOSMRails = await MapEntityFactory.CreateDBOSMMapRoads(dbOSMRails);
        fetchedOSMRails.forEach(road => {
            if (!road.CheckRemoved())
                this.AddMapRoads(road);
        });

        this.populationMethod(this, this.collapseElement);
    }

    public PassPopulationMethod(populationMethod: Function, collapseElement: HTMLElement) {
        this.populationMethod = populationMethod;
        this.collapseElement = collapseElement;
    }

    public SaveToLocalStorage() {
        if (this.initialized) {
            super.SaveToLocalStorage();
            return;
        }
        console.log("Not expected: trying to save ghost layer");
    }
}