import * as L from "leaflet";
import { MapArea } from "./maparea";
import { MapEntity } from "./mapentity";
import { MapMarker } from "./mapmarker";
import { MapRoad } from "./maproad";
import { MultiMapRoad } from "./multiroad";
import { SingleMapRoad } from "./singleroad";

export class MapLayer {
    protected layerEntities: MapEntity[] = [];
    public activeLayerGroup: L.LayerGroup;
    public layerName: string;
    private isActive: boolean = false;
    private listIndex: number;
    static globalIDGen: number = -1;
    readonly id: number;
    readonly className: string = "MapLayer";

    public constructor(name: string) {
        this.layerName = name;
        this.id = ++MapLayer.globalIDGen;
    }
    public Activate(state: boolean): boolean {
        this.isActive = state;
        return state;
    }

    public GetActiveState() {
        return this.isActive;
    }

    public GetAndToggleActiveState() {
        this.isActive = !this.isActive;
        return !this.isActive;
    }

    public AddMapMarker(marker: MapMarker) {
        this.layerEntities.push(marker);
    }

    public AddMapRoad(road: MapRoad) {
        this.layerEntities.push(road);
    }

    public AddMapArea(area: MapArea) {
        this.layerEntities.push(area);
    }

    public CreateLayerGroup(): L.LayerGroup {
        let activeMapEntities: (L.Marker | L.Polyline | L.Polygon)[] = [];

        this.layerEntities.forEach(e => {
            activeMapEntities.push(e.GetMapEntity());
            if (e instanceof MapRoad)
                e.SetupInteractivity(this.id);
        });

        return L.layerGroup(activeMapEntities);
    }

    public GetLayerGroup(): L.LayerGroup {
        this.activeLayerGroup = this.CreateLayerGroup();
        return this.activeLayerGroup;
    }

    public GetLayerEntities(): MapEntity[] {
        return this.layerEntities;
    }

    public AssignListIndex(index: number) {
        this.listIndex = index;
    }

    public Serialize(): Object {
        let entitiesList: any[] = [];

        this.layerEntities.forEach(e => {
            entitiesList.push(e.Serialize());
        });

        return {
            "entityName": this.className,
            "name": this.layerName,
            "subEntities": entitiesList
        };
    }

    public static Deserialize(serializedLayer: Object) {
        let deserializedLayer = new MapLayer(serializedLayer["name"]);
        serializedLayer["subEntities"].forEach(entity => {
            if (entity["className"] == "SingleMapRoad") {
                deserializedLayer.AddMapRoad(
                    new SingleMapRoad(entity["points"], entity["elevation"], entity["color"],
                    entity["weight"], entity["opacity"], entity["smoothFactor"])
                );
            } else if (entity["className"] == "MultiMapRoad") {
                let multiRoad = new MultiMapRoad(entity["points"], entity["elevation"], entity["color"],
                entity["weight"], entity["opacity"], entity["smoothFactor"]);
                deserializedLayer.AddMapRoad(multiRoad);

                // multiRoad.lineator.constructedRoads.forEach(cr => {
                //     deserializedLayer.AddMapRoad(cr);
                // });
            } else if (entity["className"] == "MapMarker") {
                deserializedLayer.AddMapMarker(
                    new MapMarker(entity["point"], entity["popupMsg"])
                );
            } else if (entity["className"] == "MapArea") {
                deserializedLayer.AddMapArea(
                    new MapArea(entity["points"], entity["popupMsg"])
                );
            }
        });
        return deserializedLayer;
    }
}
