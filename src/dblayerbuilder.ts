import { Modal } from "bootstrap";
import { ApiComms } from "./apicomms";
import { App } from "./app";
import { MapEntityFactory } from "./mapentityfactory";

export class DBLayerBuilder {
    static modalElement = document.getElementById("dbLayerBuilderModal");
    static showButton = document.getElementById("layerBuilderButton");
    static searchBar = document.getElementById("dbLayerBuilderSearch") as HTMLInputElement;
    static searchResults = document.getElementById("dbLayerBuilderResults");
    static createButton = document.getElementById("dbLayerBuilderModalCreateButton");
    static layerNameBar = document.getElementById("dbLayerBuilderName") as HTMLInputElement;
    static layerNameBarDiv = document.getElementById("dbLayerBuilderNameDiv");
    static elementsDownloaded = false;
    static elementInfo: Object[] = [];

    static SetInteraction() {
        this.showButton.onclick = () => {
            this.ToggleInterface();
            this.GetElementsFromDB();
        };

        this.searchBar.onkeyup = () => {
            this.LocalSearch();
        };

        this.createButton.onclick = () => {
            this.BuildLayer();
        };
    }

    static GetElementsFromDB() {
        if (this.elementsDownloaded)
            return;

        console.log("Downloading from DB");

        // let layers = JSON.parse(ApiComms.GetRequest(`${window.location.protocol}//${window.location.host}/listelements.php`));
        let layers = JSON.parse(ApiComms.GetRequest("http://localhost:3000/listelements.php"));
        for (let i = 0; i < layers["layers"].length; i++) {
            const dbMapEntity = layers["layers"][i];
            
            this.CreateEntry(dbMapEntity["name"], i);
            this.StashInfo(dbMapEntity);
        }
        this.elementsDownloaded = true;
    }

    static CreateEntry(name: string, index: number) {
        let li = document.createElement("li");
        li.setAttribute("class", "list-group-item list-group-item-dark");
        
        let input = document.createElement("input");
        input.setAttribute("class", "form-check-input me-1");
        input.setAttribute("type", "checkbox");
        input.setAttribute("value", index.toString());

        li.appendChild(input);
        li.innerHTML += "\n" + name;

        this.searchResults.appendChild(li);
    }

    static StashInfo(infoObject: Object) {
        this.elementInfo.push(infoObject);
    }

    // TODO: Now immune to click-offs and keyboard. Make better mayhaps?
    static ToggleInterface(show: boolean = true) {
        let modal = new Modal(this.modalElement);
        if (show)
            modal.show();
        else {
            this.modalElement.classList.remove("show");
            let backdrop = document.getElementsByClassName("modal-backdrop")[0];
            backdrop.parentNode.removeChild(backdrop);
            this.modalElement.style.display = "none";
        }
    }

    static BuildLayer() {
        if (!this.layerNameBar.checkValidity())
        {
            this.layerNameBarDiv.classList.add("was-validated");
            return;
        }

        let allResults = Array.from(this.searchResults.children);
        let layer = MapEntityFactory.CreateDBMapLayer(this.layerNameBar.value);
        this.ToggleInterface(false);
        this.layerNameBar.value = "";
        
        allResults.forEach(res => {
            let input = res.children[0] as HTMLInputElement;
            if (input.checked) {
                let resultInfoObject = this.elementInfo[parseInt(input.value)];
                layer.AddMapRoad(MapEntityFactory.CreateDBMultiMapRoad(resultInfoObject["id"]));
                input.checked = false;
            }
        });

        App.Instance.AddMapLayer(layer);
    }

    // https://www.w3schools.com/howto/howto_js_filter_lists.asp
    static LocalSearch() {
        let filter, li, txtValue;
        filter = this.searchBar.value.toUpperCase();
        li = this.searchResults.getElementsByTagName("li");

        for (let i = 0; i < li.length; i++) {
            txtValue = li[i].textContent.trim();

            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = "";
            } else {
                li[i].style.display = "none";
            }
        }
    }
}