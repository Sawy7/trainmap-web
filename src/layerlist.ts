import { DBMapLayer } from "./dblayer";
import { GhostDBMapLayer } from "./ghostdblayer";
import { MapLayer } from "./maplayer";
import { MapRoad } from "./maproad";

export class LayerList {
    private static _instance: LayerList;
    private activationMethod: Function;
    private warpMethod: Function;
    private removalMethod: Function;

    private constructor(){};

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    public Init(
        activationMethod: Function,
        warpMethod: Function,
        removalMethod: Function,
    ) {
        this.activationMethod = activationMethod;
        this.warpMethod = warpMethod;
        this.removalMethod = removalMethod;
    }

    public AddLayer(mapLayer: MapLayer) {
        const layersList = document.getElementById("layersList");

        // Accordions
        var accordion = document.createElement("a");
        accordion.setAttribute("class", "list-group-item list-group-item-dark d-flex justify-content-between align-items-center");
        accordion.setAttribute("href", "#");
        accordion.innerHTML = mapLayer.layerName;

        var accordionCollapse = document.createElement("div");
        accordionCollapse.setAttribute("class", "accordion-collapse collapse bg-secondary");
        accordion.onclick = () => {
            this.activationMethod(mapLayer, accordionCollapse);
        };

        var accordionBody = document.createElement("div");
        accordionBody.setAttribute("class", "accordion-body");

        var entityHeader = document.createElement("h7");
        entityHeader.innerHTML = "Elementy vrstvy";
        accordionBody.appendChild(entityHeader);

        var entityList = document.createElement("div");
        accordionBody.appendChild(entityList);
       
        if (mapLayer instanceof DBMapLayer) {
            var operationDelete = document.createElement("button");
            operationDelete.setAttribute("type", "button");
            operationDelete.setAttribute("class", "btn btn-danger float-end");
            operationDelete.onclick = () => {
                this.RemoveFromLayerList(mapLayer, accordionCollapse);
            };
            var operationDeleteIcon = document.createElement("i");
            operationDeleteIcon.setAttribute("class", "bi-trash-fill");
            operationDelete.appendChild(operationDeleteIcon);
            
            accordionBody.appendChild(document.createElement("br"));
            accordionBody.appendChild(operationDelete);
            var br = document.createElement("br");
            br.setAttribute("style", "clear:both");
            accordionBody.appendChild(br);
        }

        accordionCollapse.appendChild(accordionBody);

        layersList.appendChild(accordion);
        layersList.appendChild(accordionCollapse);

        if (mapLayer instanceof GhostDBMapLayer) {
            var badge = document.createElement("span");
            var locateIcon = document.createElement("i");
            locateIcon.setAttribute("class", "bi-cloud-arrow-down-fill")
            badge.appendChild(locateIcon);
            badge.setAttribute("class", "badge bg-primary rounded-pill");
            accordion.appendChild(badge);
            mapLayer.PassPopulationMethod(this.PopulateLayerEntitesList.bind(this), accordionCollapse);
        }
        else
            this.PopulateLayerEntitesList(mapLayer, accordionCollapse);
    }

    private PopulateLayerEntitesList(mapLayer: MapLayer, collapseElement: HTMLElement) {
        let entitiesList = <HTMLElement>collapseElement.children[0].children[1];
        if (entitiesList.innerHTML !== "")
            return;
        mapLayer.AddEntitiesToList(this.warpMethod, entitiesList);
    }

    private RemoveFromLayerList(mapLayer: MapLayer, collapseElement: HTMLElement) {
        // Deactivate the layer (remove from map)
        this.activationMethod(mapLayer, collapseElement);
        
        // Remove UI list reference
        collapseElement.previousSibling.remove(); // Link
        collapseElement.remove(); // Collapse
        
        // Remove the layer object from store
        this.removalMethod(mapLayer);

        // Rebuild localStorage (if DBLayer)
        if (!(mapLayer instanceof DBMapLayer))
            return;
    }
}
