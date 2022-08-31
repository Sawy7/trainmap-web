import * as L from "leaflet";
import { MapLayer } from "./maplayer";
import { ApiComms } from "./apicomms";
import { MultiMapRoad } from "./multiroad";

export class GeoJSONLayer extends MapLayer {
    public layerName: string;
    readonly className: string = "GeoJSONLayer";

    public constructor(name: string) {
        super(name);
        this.layerName = name;
    }

    private ParseGeoJSON() {
        let geoJSON = JSON.parse(ApiComms.GetRequest(`http://localhost:3000/getlayer.php?geotable=${this.layerName}`));
        
        geoJSON["features"].forEach(feature => {
            let type = feature["geometry"]["type"];
            if (type == "MultiLineString") {
                let lineStrings = feature["geometry"]["coordinates"];
                let mlPoints: L.LatLng[][] = [];
                let mlElevation: number[][] = [];
                lineStrings.forEach(ls => {
                    let lsPoints: L.LatLng[] = [];
                    let lsElevation: number[] = [];
                    ls.forEach(coords => {
                        lsPoints.push(new L.LatLng(coords[1], coords[0]));
                        lsElevation.push(coords[2]);
                    });
                    mlPoints.push(lsPoints);
                    mlElevation.push(lsElevation);
                });
                this.multiRoads.push(new MultiMapRoad(mlPoints, mlElevation));
            } else {
                console.log("Unknown feature type!")
            }
        });
    }

    public CreateLayerGroup(): L.LayerGroup {
        this.ParseGeoJSON();        
        return super.CreateLayerGroup();
    }
}
