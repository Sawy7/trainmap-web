import L from "leaflet";
import { MapArea } from "./maparea";
import { MapEntity } from "./mapentity";
import { MapMarker } from "./mapmarker";
import { MapRoad } from "./maproad";

export class MapLayer {
    protected layerEntities: MapEntity[] = [];
    public activeLayerGroup: L.LayerGroup;
    public layerName: string;
    protected layerColor: string;
    private isActive: boolean = false;
    static globalIDGen: number = -1;
    readonly id: number;
    readonly className: string = "MapLayer";

    public constructor(name: string, color?: string) {
        this.layerName = name;
        this.layerColor = color;
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
            let gotEntity = e.GetMapEntity();
            if (this.layerColor !== undefined)
                gotEntity.setStyle({color: this.layerColor});
            activeMapEntities.push(gotEntity);
            if (e instanceof MapRoad)
                e.SetupInteractivity(this.id);
        });

        return L.layerGroup(activeMapEntities);
    }

    public GetLayerGroup(): Promise<L.LayerGroup> {
        this.activeLayerGroup = this.CreateLayerGroup();

        return new Promise((resolve) => {
            resolve(this.activeLayerGroup);
        });

        // return this.activeLayerGroup;
    }

    public GetLayerEntities(): MapEntity[] {
        return this.layerEntities;
    }

    // public Serialize(): Object {
    //     let entitiesList: any[] = [];

    //     this.layerEntities.forEach(e => {
    //         entitiesList.push(e.Serialize());
    //     });

    //     return {
    //         "entityName": this.className,
    //         "name": this.layerName,
    //         "subEntities": entitiesList
    //     };
    // }

    // public static Deserialize(serializedLayer: Object) {
    //     let deserializedLayer = MapEntityFactory.CreateMapLayer(serializedLayer["name"]);
    //     serializedLayer["subEntities"].forEach(entity => {
    //         if (entity["className"] == "SingleMapRoad") {
    //             deserializedLayer.AddMapRoad(
    //                 MapEntityFactory.CreateSingleMapRoad(entity["points"], entity["elevation"], entity["color"],
    //                 entity["weight"], entity["opacity"], entity["smoothFactor"])
    //             );
    //         } else if (entity["className"] == "MultiMapRoad") {
    //             let multiRoad = MapEntityFactory.CreateMultiMapRoad(entity["points"], entity["elevation"], entity["color"],
    //             entity["weight"], entity["opacity"], entity["smoothFactor"]);
    //             deserializedLayer.AddMapRoad(multiRoad);

    //             // multiRoad.lineator.constructedRoads.forEach(cr => {
    //             //     deserializedLayer.AddMapRoad(cr);
    //             // });
    //         } else if (entity["className"] == "MapMarker") {
    //             deserializedLayer.AddMapMarker(
    //                 MapEntityFactory.CreateMapMarker(entity["point"], entity["popupMsg"])
    //             );
    //         } else if (entity["className"] == "MapArea") {
    //             deserializedLayer.AddMapArea(
    //                 MapEntityFactory.CreateMapArea(entity["points"], entity["popupMsg"])
    //             );
    //         }
    //     });
    //     return deserializedLayer;
    // }
}
