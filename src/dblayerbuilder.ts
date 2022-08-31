import { Modal } from "bootstrap";
import { ApiComms } from "./apicomms";

export class DBLayerBuilder {
    private modalElement = document.getElementById("dbLayerBuilderModal");
    private showButton = document.getElementById("layerBuilderButton");
    private searchBar = document.getElementById("dbLayerBuilderSearch") as HTMLInputElement;
    private searchResults = document.getElementById("dbLayerBuilderResults");
    private createButton = document.getElementById("dbLayerBuilderModalCreateButton");

    constructor() {
        this.ToggleInterface();
        this.SetInteraction();
        this.GetElementsFromDB();
    }

    private SetInteraction() {
        this.showButton.onclick = () => {
            this.ToggleInterface();
        };

        this.searchBar.onkeyup = () => {
            this.LocalSearch();
        };

        this.createButton.onclick = () => {
            this.BuildLayer();
        };
    }

    private GetElementsFromDB() {
        let layers = JSON.parse(ApiComms.GetRequest("http://localhost:3000/listlayers.php"));
        layers["layers"].forEach(dbMapEntity => {
            this.CreateEntry(dbMapEntity["name"], dbMapEntity["id"]);
        });
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

    public ToggleInterface() {
        if (!this.modalElement.classList.contains("show")) {
            let modal = new Modal(this.modalElement);
            modal.show();
        }
    }

    private BuildLayer() {
        let allResults = this.searchResults.children;
        let layerIDs: number[] = [];
        Array.from(allResults).forEach(res => {
            let input = res.children[0] as HTMLInputElement;
            if (input.checked)
                layerIDs.push(parseInt(input.value));
        });
        console.log(layerIDs);
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