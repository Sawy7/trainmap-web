import * as L from "leaflet";
import { GeoJsonObject } from "geojson";
import { MapLayer } from "./maplayer";
import { MapEntity } from "./mapentity";
import { LocalLayer } from "./locallayer";
import { ApiComms } from "./apicomms";

export class GeoJSONLayer extends MapLayer {
    public activeLayerGroup: L.LayerGroup;
    public layerName: string;
    // private geoJSON: GeoJsonObject;
    readonly className: string = "GeoJSONLayer";

    public constructor(name: string) {
        super(name);
        this.layerName = name;
        // this.geoJSON = geoJSON;
    }

    public CreateLayerGroup(): L.LayerGroup {
        let geoJSON = JSON.parse(ApiComms.GetRequest(`http://localhost:3000/getlayer.php?geotable=${this.layerName}&geomfield=geom`));

        return L.geoJSON(geoJSON);
    }

    public GetLayerEntities(): MapEntity[] {
        let entitiesList: MapEntity[] = [];
        // // let listActionInfo: [string[], Function][];

        // this.layerMarkers.forEach(m => {
        //     entitiesList.push(m);
        // });
        // this.layerRoads.forEach(r => {
        //     entitiesList.push(r);
        // });
        // this.multiRoads.forEach(r => {
        //     entitiesList.push(r);
        // });
        // this.layerAreas.forEach(a => {
        //     entitiesList.push(a);
        // });

        return entitiesList;
    }

    public Serialize(): Object {
        let entitiesList: any[] = [];

        // this.layerMarkers.forEach(m => {
        //     entitiesList.push(m.Serialize());
        // });
        // this.layerRoads.forEach(r => {
        //     entitiesList.push(r.Serialize());
        // });
        // this.multiRoads.forEach(r => {
        //     entitiesList.push(r.Serialize());
        // });
        // this.layerAreas.forEach(a => {
        //     entitiesList.push(a.Serialize());
        // });

        return {
            "entityName": this.className,
            "name": this.layerName,
            "subEntities": entitiesList
        };
    }
}
