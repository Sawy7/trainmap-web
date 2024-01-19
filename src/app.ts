import L from "leaflet";
import { Offcanvas, Collapse, Modal } from "bootstrap";
import { MapWindowFull } from "./mapwindowfull";
import { MapLayer } from "./maplayer";
import { DBMapLayer } from "./dblayer";
import { DBLayerBuilder } from "./dblayerbuilder";
import { ElevationChart } from "./elevationchart";
import { FileLoader } from "./fileloader";
import { MapEntityFactory } from "./mapentityfactory";
import { LayerList } from "./layerlist";
import { LogNotify } from "./lognotify";
import { SingleMapRoad } from "./singleroad";
import { DBMapEntityCache } from "./dbentitycache";
import { UsersApiMgr } from "./usersapimgr";
import { FormUtilities } from "./formutilities";

// TS Singleton: https://stackoverflow.com/questions/30174078/how-to-define-singleton-in-typescript
export class App {
    private mapWindow: MapWindowFull;
    private localLayers: MapLayer[] = [];
    private layerList: LayerList;
    private activeElevationChart: ElevationChart;
    private sidebarOffcanvas: Offcanvas = new Offcanvas(document.getElementById("offcanvasNavbar"));
    private layerActivating: boolean = false;
    private markersHidden: boolean;
    private hideMarkersButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("hideMarkersButton");
    private static _instance: App;

    private constructor() { };

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    public SetupButtons() {
        document.getElementById("offcanvasNavbarButton").onclick = () => {
            this.sidebarOffcanvas.toggle();
        };

        this.hideMarkersButton.onclick = () => {
            this.HideMarkersInLayers();
        };

        const passwordChangeButton = document.getElementById("passChangeModalButton");
        passwordChangeButton.onclick = () => {
            this.ChangePassword();
        };

        DBLayerBuilder.SetInteraction();
    }

    public Init(centerLat: number, centerLong: number, zoom: number) {
        this.mapWindow = new MapWindowFull(centerLat, centerLong, zoom);
        this.UpdatePreferences();
        this.SetupButtons();
        this.InitLayerList();
        FileLoader.SetupFileLoader();
        this.OnlineDBCheck();
        this.ValidatePasswordFields();
    }

    private UpdatePreferences() {
        if (this.markersHidden === undefined) {
            if (localStorage["preferences"] === undefined) {
                localStorage["preferences"] = JSON.stringify({ "markersHidden": false });
                this.markersHidden = false;
            }
            else
                this.markersHidden = JSON.parse(localStorage["preferences"])["markersHidden"];
        } else {
            localStorage["preferences"] = JSON.stringify({ "markersHidden": this.markersHidden });
        }

        let hiddenMarkersButtonIcon = this.hideMarkersButton.children[0];
        if (this.markersHidden)
            hiddenMarkersButtonIcon.setAttribute("class", "bi bi-geo");
        else
            hiddenMarkersButtonIcon.setAttribute("class", "bi bi-geo-fill");
    }

    private InitLayerList() {
        this.layerList = LayerList.Instance;
        this.layerList.Init(
            this.ActivateMapLayer.bind(this),
            this.mapWindow.WarpToPoint.bind(this.mapWindow),
            this.RemoveMapLayer.bind(this),
        );
    }

    private OnlineDBCheck() {
        // TODO: Flip to actual PHP script
        // let onlineDBTimestamp = ApiMgr.OnlineDBCheck()["timestamp"];
        let onlineDBTimestamp = JSON.parse('{ "type": "OnlineDBCheck", "timestamp": 1705505759478 }')["timestamp"];

        let localStorageTimestamp;
        if (localStorage["onlinedbtimestamp"] !== undefined)
            localStorageTimestamp = JSON.parse(localStorage["onlinedbtimestamp"]);
        else
            localStorageTimestamp = 0;

        if (localStorageTimestamp < onlineDBTimestamp) {
            LogNotify.PushAlert("Databáze na serveru byla změněna. Byly resetovány lokální cache.")
            DBMapEntityCache.Instance.ClearRails();
            DBMapEntityCache.Instance.ClearStations();
            localStorage["onlinedbtimestamp"] = onlineDBTimestamp;
        }
    }

    private RemoveMapLayer(mapLayer: MapLayer) {
        let layerIndex = this.localLayers.indexOf(mapLayer);
        if (layerIndex != -1) {
            this.localLayers.splice(layerIndex, 1);
        }

        if (mapLayer instanceof DBMapLayer)
            mapLayer.RemoveFromLocalStorage();
    }

    public AddMapLayer(mapLayer: MapLayer, notFromStorage: boolean = true) {
        // Change hiddenMarker preference
        mapLayer.MapMarkersHide(this.markersHidden);

        this.localLayers.push(mapLayer);
        this.layerList.AddLayer(mapLayer);

        if (mapLayer instanceof DBMapLayer && notFromStorage)
            (mapLayer as DBMapLayer).SaveToLocalStorage();
    }

    private ActivateMapLayer(mapLayer: MapLayer, collapseElement: HTMLElement) {
        if (this.layerActivating)
            return;
        this.layerActivating = true;

        const mapLayerNewState = !mapLayer.GetAndToggleActiveState();
        this.mapWindow.RenderMapLayer(mapLayer, mapLayerNewState);

        if (this.activeElevationChart !== undefined && !mapLayerNewState && this.activeElevationChart.layerID == mapLayer.id)
            this.activeElevationChart.HideChart();

        let collapse = new Collapse(collapseElement);
        collapse.toggle();

        let collapseEvent: string;
        if (mapLayerNewState)
            collapseEvent = "shown.bs.collapse";
        else
            collapseEvent = "hidden.bs.collapse";

        collapseElement.addEventListener(collapseEvent, () => {
            this.layerActivating = false;
        }, { once: true });
    }

    public SetElevationChart(mapRoad: SingleMapRoad) {
        if (this.activeElevationChart !== undefined) {
            if (this.activeElevationChart.IsSameMapRoad(mapRoad) && this.activeElevationChart.CheckUIVisible())
                return;

            this.activeElevationChart.DestroyChart();
            this.activeElevationChart = undefined;
        }
        this.activeElevationChart = new ElevationChart(mapRoad, this.mapWindow.WarpToPoint.bind(this.mapWindow));
    }

    public LoadFromLocalStorage() {
        if (localStorage["dblayers"] === undefined)
            return;

        let storageList = JSON.parse(localStorage["dblayers"]);
        for (let i = 0; i < storageList.length; i++) {
            let layer = MapEntityFactory.CreateGhostDBMapLayer(
                storageList[i]["name"], storageList[i]["elements"],
                storageList[i]["color"], storageList[i]["id"]
            );
            this.AddMapLayer(layer, false);
        }
    }

    public RenderElevationMarker(point?: L.LatLng) {
        App.Instance.mapWindow.RenderElevationMarker(point);
    }

    public HideMarkersInLayers() {
        this.markersHidden = !this.markersHidden;
        this.localLayers.forEach(layer => {
            layer.MapMarkersHide(this.markersHidden);
            if (layer.GetActiveState()) {
                this.mapWindow.RenderMapLayer(layer, false);
                this.mapWindow.RenderMapLayer(layer, true);
            }
        });
        this.UpdatePreferences();
    }

    private ValidatePasswordFields() {
        const newPassword = document.getElementById("passwordEdit") as HTMLInputElement;
        const newPasswordAgain = document.getElementById("passwordAgainEdit") as HTMLInputElement;
        const submitButton = document.getElementById("passChangeModalButton") as HTMLButtonElement;

        newPassword.onkeyup = () => {
            FormUtilities.ValidatePassword(newPassword, newPasswordAgain, submitButton);
        }

        newPasswordAgain.onkeyup = () => {
            FormUtilities.ValidatePassword(newPassword, newPasswordAgain, submitButton);
        }
    }

    private ChangePassword() {
        // Send request
        const oldPassword = document.getElementById("oldPassword") as HTMLInputElement;
        const newPassword = document.getElementById("passwordEdit") as HTMLInputElement;
        const newPasswordAgain = document.getElementById("passwordAgainEdit") as HTMLInputElement;
        const submitButton = document.getElementById("passChangeModalButton") as HTMLButtonElement;
        let result = UsersApiMgr.ChangePasswordUser(oldPassword.value, newPassword.value);
        if (result["type"] === "success") {
            LogNotify.PushAlert("Změna hesla byla úspěšná", undefined, undefined, "success");
        } else {
            let errorMsg: string;
            if (result["value"] == "wrong-pass")
                errorMsg = "Aktuální heslo není správné";
            else if (result["value"] == "too-many-reqs")
                errorMsg = "Příliš mnoho požadavků. Zkuste to později.";
            else
                errorMsg = "Neznámá chyba";
            LogNotify.PushAlert(errorMsg, undefined, undefined, "danger");
        }

        // Hide modal
        const modalElement = document.getElementById("passChangeModal");
        const modal = new Modal(modalElement);
        modal.hide();
        modalElement.classList.remove("show");
        const backdrop = document.getElementsByClassName("modal-backdrop")[0];
        backdrop.parentNode.removeChild(backdrop);
        modalElement.style.display = "none";

        // Clear form
        oldPassword.value = "";
        newPassword.value = "";
        newPasswordAgain.value = "";
        FormUtilities.ValidatePassword(newPassword, newPasswordAgain, submitButton);
    }

    public SaveTextToDisk(text: string, filename: string, type: string = "text/plain") {
        let data = new Blob([text], { type: type });
        let link = window.URL.createObjectURL(data);
        this.DownloadLink(link, filename);
        window.URL.revokeObjectURL(link);
    }

    // https://stackoverflow.com/questions/11620698/how-to-trigger-a-file-download-when-clicking-an-html-button-or-javascript
    private DownloadLink(link: string, filename: string) {
        const a = document.createElement("a");
        a.href = link;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
