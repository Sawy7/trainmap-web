import { DBMapLayer } from "./dblayer";
import { GhostDBMapLayer } from "./ghostdblayer";
import { MapLayer } from "./maplayer";

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
        accordion.textContent = mapLayer.GetLayerName();

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
            // Delele button
            var operationDelete = document.createElement("button");
            operationDelete.setAttribute("type", "button");
            operationDelete.setAttribute("class", "btn btn-danger float-end");
            operationDelete.onclick = () => {
                this.RemoveFromLayerList(mapLayer, accordionCollapse);
            };
            var operationDeleteIcon = document.createElement("i");
            operationDeleteIcon.setAttribute("class", "bi-trash-fill");
            operationDelete.appendChild(operationDeleteIcon);

            // Edit button
            var operationEdit = document.createElement("button");
            operationEdit.setAttribute("type", "button");
            operationEdit.setAttribute("class", "btn btn-warning float-end");
            operationEdit.onclick = () => {
                this.EditInLayerList(mapLayer, operationEdit, accordion);
            };
            var operationEditIcon = document.createElement("i");
            operationEditIcon.setAttribute("class", "bi-pencil-fill");
            operationEdit.appendChild(operationEditIcon);
            
            accordionBody.appendChild(document.createElement("br"));
            accordionBody.appendChild(operationDelete);
            accordionBody.appendChild(operationEdit);
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

    private EditInLayerList(mapLayer: MapLayer, operationEdit: HTMLButtonElement, accordion: HTMLElement) {
        operationEdit.setAttribute("style", "display: none");

        let previousOnclick = accordion.onclick;
        let previousLayerName = mapLayer.GetLayerName();
        let previousLayerColor = mapLayer.GetColor();

        accordion.onclick = null;
        accordion.innerHTML = "";
        accordion.removeAttribute("href");

        let input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("placeholder", "Název vrstvy");
        input.setAttribute("class", "form-control");
        input.setAttribute("value", previousLayerName);

        let color = document.createElement("input");
        color.setAttribute("type", "color");
        color.setAttribute("title", "Barva vrstvy");
        color.setAttribute("class", "form-control form-control-color");
        color.setAttribute("value", previousLayerColor);

        var submitButton = document.createElement("button");
        submitButton.setAttribute("type", "button");
        submitButton.setAttribute("class", "btn btn-success float-end");
        submitButton.onclick = () => {
            if (input.value != previousLayerName || color.value != previousLayerColor) {
                // if (color.value != previousLayerColor) {
                //     this.activationMethod(mapLayer, false);
                //     this.activationMethod(mapLayer, true);
                // }
                mapLayer.ChangeLayerName(input.value);
                mapLayer.ChangeColor(color.value);
                if (mapLayer instanceof DBMapLayer)
                    mapLayer.UpdateProperitesInLocalStorage();
            }

            operationEdit.removeAttribute("style");
            accordion.textContent = input.value;
            accordion.setAttribute("href", "#");
            accordion.onclick = previousOnclick;
        };
        var submitButtonIcon = document.createElement("i");
        submitButtonIcon.setAttribute("class", "bi-check");
        submitButton.appendChild(submitButtonIcon);

        var cancelButton = document.createElement("button");
        cancelButton.setAttribute("type", "button");
        cancelButton.setAttribute("class", "btn btn-danger float-end");
        cancelButton.onclick = () => {
            operationEdit.removeAttribute("style");
            accordion.textContent = previousLayerName;
            accordion.setAttribute("href", "#");
            accordion.onclick = previousOnclick;
        };
        var cancelButtonIcon = document.createElement("i");
        cancelButtonIcon.setAttribute("class", "bi-x");
        cancelButton.appendChild(cancelButtonIcon);

        accordion.appendChild(input);
        accordion.appendChild(color);
        accordion.appendChild(cancelButton);
        accordion.appendChild(submitButton);
    }
}
