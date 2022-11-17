import { Modal } from "bootstrap";
import { ApiMgr } from "./apimgr";
import { App } from "./app";
import { GeoGetter } from "./GeoGetter";
import { LogNotify } from "./lognotify";
import { MapEntityFactory } from "./mapentityfactory";

export class DBLayerBuilder {
    static modalElement = document.getElementById("dbLayerBuilderModal");
    static showButton = document.getElementById("layerBuilderButton");
    static searchBar = document.getElementById("dbLayerBuilderSearch") as HTMLInputElement;
    static searchResults = document.getElementById("dbLayerBuilderResults");
    static createButton = document.getElementById("dbLayerBuilderModalCreateButton");
    static layerNameBar = document.getElementById("dbLayerBuilderName") as HTMLInputElement;
    static layerNameBarDiv = document.getElementById("dbLayerBuilderNameDiv");
    static layerColorPicker = document.getElementById("dbLayerBuilderColor") as HTMLInputElement;
    static checkAll = document.getElementById("dbLayerBuilderCheckAll") as HTMLInputElement;
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

        this.checkAll.onclick = () => {
            this.CheckAllVisible();
        };
    }

    static GetElementsFromDB() {
        if (this.elementsDownloaded)
            return;

        this.ClearBoxes();

        console.log("Downloading from DB");

        LogNotify.ToggleThrobber();

        setTimeout(() => {
            let layers = ApiMgr.ListElements();
            for (let i = 0; i < layers["layers"].length; i++) {
                const dbMapEntity = layers["layers"][i];
                
                this.CreateEntry(dbMapEntity, i);
                this.StashInfo(dbMapEntity, "maproad_legacy");
            }
            let offset = layers["layers"].length;
            let rails = ApiMgr.ListRails();
            for (let i = offset; i < offset+rails["layers"].length; i++) {
                const dbMapEntity = rails["layers"][i-offset];
                
                this.CreateEntry(dbMapEntity, i);
                this.StashInfo(dbMapEntity, "rail");
            }
            offset += rails["layers"].length;
            let osmRails = ApiMgr.ListOSMRails();
            for (let i = offset; i < offset+osmRails["layers"].length; i++) {
                const dbMapEntity = osmRails["layers"][i-offset];
                
                this.CreateEntry(dbMapEntity, i);
                this.StashInfo(dbMapEntity, "osmrail");
            }
            this.elementsDownloaded = true;
            LogNotify.ToggleThrobber();
        }, 0);
    }

    static ParseTags(tags: string) {
        return tags.replace(/;/g, " • ");
    }

    static CreateEntry(infoObject: Object, index: number) {
        let label = document.createElement("label");
        label.setAttribute("class", "list-group-item list-group-item-dark");

        let contentDiv = document.createElement("div");
        contentDiv.setAttribute("class", "fw-bold");
        
        let input = document.createElement("input");
        input.setAttribute("class", "form-check-input me-1");
        input.setAttribute("type", "checkbox");
        input.setAttribute("value", index.toString());

        contentDiv.appendChild(input);
        contentDiv.innerHTML += "\n" + infoObject["name"];

        label.appendChild(contentDiv);

        if (infoObject["tags"] != null)
            label.innerHTML += "\n" + this.ParseTags(infoObject["tags"]);

        this.searchResults.appendChild(label);
        label.onclick = () => {
            this.LocalSearch();
        };
    }

    static StashInfo(infoObject: Object, type: string) {
        infoObject["type"] = type;
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

    static IsInputChecked(entity: HTMLElement) {
        return (entity.children[0] as HTMLInputElement).checked;
    }

    static BuildLayer() {
        if (!this.layerNameBar.checkValidity())
        {
            this.layerNameBarDiv.classList.add("was-validated");
            return;
        }

        let allResults = Array.from(this.searchResults.children);
        let layer = MapEntityFactory.CreateDBMapLayer(this.layerNameBar.value, this.layerColorPicker.value);
        this.ToggleInterface(false);
        this.layerNameBar.value = "";

        let dbRails: number[] = [];
        let dbElements: number[] = [];
        let dbOSMRails: number[] = [];
        
        LogNotify.ToggleThrobber();
        let inputIndex = 1;
        allResults.forEach(res => {
            let input = res.children[0].children[0] as HTMLInputElement;
            if (input.checked) {
                LogNotify.UpdateThrobberMessage(`Získávání ${inputIndex++}`);
                let resultInfoObject = this.elementInfo[parseInt(input.value)];
                if (resultInfoObject["type"] == "rail")
                    dbRails.push(resultInfoObject["relcislo"]);
                else if (resultInfoObject["type"] == "maproad_legacy")
                    dbElements.push(resultInfoObject["id"]);
                else if (resultInfoObject["type"] == "osmrail")
                    dbOSMRails.push(resultInfoObject["relcislo"]);
                input.checked = false;
            }
        });
        
        // Call for all categories at once
        GeoGetter.GetRails(dbRails).forEach(road => {
            layer.AddMapRoad(road);
        });
        GeoGetter.GetElements(dbElements).forEach(road => {
            layer.AddMapRoad(road);
        });
        GeoGetter.GetOSMRails(dbOSMRails).forEach(road => {
            layer.AddMapRoad(road);
        });

        LogNotify.ToggleThrobber();

        App.Instance.AddMapLayer(layer);
    }

    static ClearBoxes() {
        // This is done elsewhere
        // let allResults = Array.from(this.searchResults.children);
        // allResults.forEach(res => {
        //     let input = res.children[0].children[0] as HTMLInputElement;
        //     input.checked = false;
        // });

        this.searchBar.value = "";
        this.LocalSearch();
        this.layerNameBar.value = "";
        this.checkAll.checked = false;
    }

    static CheckAllVisible() {
        let checkAllStatus = this.checkAll.checked;
        
        let allResults = Array.from(this.searchResults.children);
        allResults.forEach(res => {
            let result = res as HTMLElement;
            if (result.style.display != "none") {
                let input = res.children[0].children[0] as HTMLInputElement;
                input.checked = checkAllStatus;
            }
        });
    }

    static CheckAllVisibleChecked() {
        let allResults = Array.from(this.searchResults.children);

        let everythingChecked = true;
        allResults.forEach(res => {
            let result = res as HTMLElement;
            let input = res.children[0].children[0] as HTMLInputElement;
            if (result.style.display != "none" && !input.checked) {
                everythingChecked = false;
                return
            }
        });

        this.checkAll.checked = everythingChecked;
    }

    // https://www.w3schools.com/howto/howto_js_filter_lists.asp
    static LocalSearch() {
        let filter, li, txtValue;
        filter = this.searchBar.value.toUpperCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
        li = this.searchResults.getElementsByTagName("li");

        for (let i = 0; i < li.length; i++) {
            txtValue = li[i].textContent.trim();

            if (txtValue.toUpperCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").indexOf(filter) > -1) {
                li[i].setAttribute("class", "list-group-item list-group-item-dark top-item");
                li[i].style.display = "";
            } else if (li[i].children[0].children[0].checked) {
                li[i].setAttribute("class", "list-group-item list-group-item-warning bottom-item");
                li[i].style.display = "";
            } else {
                li[i].style.display = "none";
            }
        }

        this.CheckAllVisibleChecked();
    }
}