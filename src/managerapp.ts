import { MapWindow } from "./mapwindow";
import { ApiMgr } from "./apimgr";
import { LogNotify } from "./lognotify";
import { MapEntityFactory } from "./mapentityfactory";
import { DBMapLayer } from "./dblayer";

// TS Singleton: https://stackoverflow.com/questions/30174078/how-to-define-singleton-in-typescript
export class ManagerApp {
    private mapWindow: MapWindow;
    private railListElement: HTMLSelectElement = document.getElementById("railList") as HTMLSelectElement;
    private activeMapLayer: DBMapLayer;
    private static _instance: ManagerApp;

    private constructor() { };

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    public Init(centerLat: number, centerLong: number, zoom: number) {
        this.mapWindow = new MapWindow(centerLat, centerLong, zoom);
        this.InitRailList();
        this.RailChange();
    }

    private async RailChange() {
        const selectedOption = this.railListElement.selectedOptions[0] as HTMLOptionElement;
        if (selectedOption.disabled)
            return;
        const dbID = parseInt(selectedOption.value);

        let resultArray;
        if (selectedOption.getAttribute("type") === "rail")
            resultArray = await MapEntityFactory.CreateDBSingleMapRoads([dbID]);
        else
            resultArray = await MapEntityFactory.CreateDBOSMMapRoads([dbID]);

        const mapRoad = resultArray[0];
        console.log(mapRoad);
        // NOTE: This patches spawning of ElevationChart (from Mapster main)
        mapRoad.ClickSetElevationChart = () => {};
        if (this.activeMapLayer !== undefined)
            this.mapWindow.RenderMapLayer(this.activeMapLayer, false);
        this.activeMapLayer = MapEntityFactory.CreateDBMapLayer("previewlayer", "blue");
        this.activeMapLayer.AddMapRoads(mapRoad);
        this.mapWindow.RenderMapLayer(this.activeMapLayer);
        this.mapWindow.WarpToPoint(mapRoad.GetSignificantPoint(), 9);
    }

    private InitRailList() {
        const rails = ApiMgr.ListRails();
        // NOTE: OSM rails disabled //////////////////////////////////////////////////////
        // const osmRails = ApiMgr.ListOSMRails();
        const osmRails = { "status": "ok", "layers": [] };
        //////////////////////////////////////////////////////////////////////////////////
        if (rails["status"] != "ok" || osmRails["status"] != "ok") {
            LogNotify.PushAlert("Aplikace je nedostupná (síťová chyba). Zkuste to znovu později.",
                undefined, undefined, "danger");
            return;
        }

        // Add rails to dropdown
        rails["layers"].forEach(rail => {
            const optionElement = document.createElement("option");
            optionElement.textContent = rail["name"];
            optionElement.value = rail["relcislo"];
            optionElement.setAttribute("type", "rail");
            this.railListElement.appendChild(optionElement);
        });
        osmRails["layers"].forEach(rail => {
            const optionElement = document.createElement("option");
            optionElement.textContent = rail["name"];
            optionElement.value = rail["relcislo"];
            optionElement.setAttribute("type", "osmrail");
            this.railListElement.appendChild(optionElement);
        });

        // Add dynamic functionality
        this.railListElement.onchange = this.RailChange.bind(this);
    }
}