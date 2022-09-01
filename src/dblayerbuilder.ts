import { Modal } from "bootstrap";
import { ApiComms } from "./apicomms";
import { App } from "./app";
import { DBMultiMapRoad } from "./dbmultiroad";
import { MapLayer } from "./maplayer";

export class DBLayerBuilder {
    private modalElement = document.getElementById("dbLayerBuilderModal");
    private showButton = document.getElementById("layerBuilderButton");
    private searchBar = document.getElementById("dbLayerBuilderSearch") as HTMLInputElement;
    private searchResults = document.getElementById("dbLayerBuilderResults");
    private createButton = document.getElementById("dbLayerBuilderModalCreateButton");
    private layerNameBar = document.getElementById("dbLayerBuilderName") as HTMLInputElement;
    private layerNameBarDiv = document.getElementById("dbLayerBuilderNameDiv");
    private elementsDownloaded = false;

    constructor() {
        this.SetInteraction();
    }

    private SetInteraction() {
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

    private GetElementsFromDB() {
        if (this.elementsDownloaded)
            return;

        console.log("Downloading from DB");

        // let layers = JSON.parse(ApiComms.GetRequest(`${window.location.protocol}//${window.location.host}/listlayers.php`));
        let layers = JSON.parse(ApiComms.GetRequest("http://localhost:3000/listlayers.php"));
        layers["layers"].forEach(dbMapEntity => {
            this.CreateEntry(dbMapEntity["name"], dbMapEntity["id"]);
        });
        this.elementsDownloaded = true;
    }

    private CreateEntry(name: string, id: number) {
        let li = document.createElement("li");
        li.setAttribute("class", "list-group-item list-group-item-dark");
        
        let input = document.createElement("input");
        input.setAttribute("class", "form-check-input me-1");
        input.setAttribute("type", "checkbox");
        input.setAttribute("value", id.toString());

        li.appendChild(input);
        li.innerHTML += "\n" + name;

        this.searchResults.appendChild(li);
    }

    public ToggleInterface(show: boolean = true) {
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

    private BuildLayer() {
        if (!this.layerNameBar.checkValidity())
        {
            this.layerNameBarDiv.classList.add("was-validated");
            return;
        }

        let allResults = Array.from(this.searchResults.children);
        let layer = new MapLayer(this.layerNameBar.value);
        this.ToggleInterface(false);
        this.layerNameBar.value = "";
        allResults.forEach(res => {
            let input = res.children[0] as HTMLInputElement;
            if (input.checked) {
                let resultName = res.textContent.trim();
                layer.AddMultiRoad(new DBMultiMapRoad(parseInt(input.value), resultName));
                input.checked = false;
            }
        });

        App.Instance.AddMapLayer(layer);
    }

    // https://www.w3schools.com/howto/howto_js_filter_lists.asp
    private LocalSearch() {
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