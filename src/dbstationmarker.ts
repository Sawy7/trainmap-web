import L from "leaflet";
import { MapMarker } from "./mapmarker";
import { Popover } from "bootstrap";

export class DBStationMapMarker extends MapMarker {
    private orderIndex: number;
    private consumptionOrderIndex: number;
    private dbID: number;
    readonly className: string = "DBMapMarker";
    private included = true;

    constructor(geoJSON: object) {
        super();

        let type = geoJSON["geometry"]["type"];
        if (type == "Point") {
            let coords = geoJSON["geometry"]["coordinates"];
            this.Init(
                new L.LatLng(coords[1], coords[0]),
                `Název: ${geoJSON["properties"]["name"]}`,
                geoJSON["properties"]["name"],
                "custom-assets/station.svg",
                20
            );
            this.orderIndex = geoJSON["properties"]["order"];
            this.dbID = geoJSON["properties"]["id"];
        } else {
            console.log("Unknown feature type!")
        }
    }

    public GetLink(warpMethod: Function): HTMLElement {
        return undefined;
    }

    public GetStationCrumb(warpMethod: Function, reRenderMethod: Function): HTMLAnchorElement {
        const stationIcon = document.createElement("i");
        stationIcon.setAttribute("class", "bi bi-train-front-fill");

        const stationCrumb = document.createElement("a");
        stationCrumb.setAttribute("href", "#");
        stationCrumb.setAttribute("class", "breadcrumb-item");
        stationCrumb.setAttribute("title", "Title");
        stationCrumb.setAttribute("data-popover-content", "popoverContent");
        if (!this.IsIncluded())
            stationCrumb.style.color = "var(--bs-red)";
        stationCrumb.appendChild(stationIcon);
        const stationListInfo = this.GetListInfo();
        const stationName = ` ${stationListInfo}`;
        stationCrumb.appendChild(document.createTextNode(stationName));

        new Popover(stationCrumb, {
            "placement": "auto",
            "trigger": "focus",
            "html": true,
            "title": stationListInfo,
            "content": () => {
                const buttons = document.createElement("div");
                buttons.setAttribute("class", "list-group");

                const showOnMapButton = document.createElement("a");
                showOnMapButton.setAttribute("class", "btn btn-primary");
                showOnMapButton.innerHTML = "<i class='bi bi-geo-alt-fill'></i> Zobrazit na mapě";
                showOnMapButton.addEventListener("click", () => {
                    warpMethod(this.GetSignificantPoint());
                }, { "once": true });

                buttons.appendChild(showOnMapButton);

                const includeButton = document.createElement("a");
                if (this.IsIncluded()) {
                    includeButton.setAttribute("class", "btn btn-danger");
                    includeButton.innerHTML = "<i class='bi bi-x'></i> Vynechat z grafu";
                }
                else {
                    includeButton.setAttribute("class", "btn btn-success");
                    includeButton.innerHTML = "<i class='bi bi-check'></i> Zahrnout v grafu";
                }
                includeButton.addEventListener("click", () => {
                    const newState = this.ToggleIncluded();
                    if (newState)
                        stationCrumb.setAttribute("style", "");
                    else
                        stationCrumb.setAttribute("style", "color: var(--bs-red)");

                    // Setup re-render of graph
                    reRenderMethod();
                }, { "once": true });

                buttons.appendChild(includeButton);
                return buttons;
            }
        });

        return stationCrumb;
    }

    // Right after calculating the consumption, this gives modified (API) values (only once)
    public GetOrderIndex(): number {
        if (this.consumptionOrderIndex !== undefined) {
            const toReturn = this.consumptionOrderIndex;
            this.consumptionOrderIndex = undefined;
            return toReturn;
        }
        return this.orderIndex;
    }

    public SetOrderIndex(orderIndex: number) {
        this.orderIndex = orderIndex;
    }

    public SetConsumptionOrderIndex(orderIndex: number) {
        this.consumptionOrderIndex = orderIndex;
    }

    public GetStationID(): number {
        return this.dbID;
    }

    public IsIncluded(): boolean {
        return this.included;
    }

    public ToggleIncluded() {
        this.included = !this.included;
        return this.included;
    }
}
