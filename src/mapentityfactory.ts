import { LatLng } from "leaflet";

import { DBMapLayer } from "./dblayer";
import { DBMultiMapRoad } from "./dbmultiroad";
import { DBSingleMapRoad } from "./dbsingleroad";
import { MapArea } from "./maparea";
import { MapLayer } from "./maplayer"
import { MapMarker } from "./mapmarker";
import { MultiMapRoad } from "./multiroad";
import { SingleMapRoad } from "./singleroad";

export class MapEntityFactory {
    // Layers
    public static CreateMapLayer(name: string): MapLayer {
        return new MapLayer(name);
    }

    public static CreateDBMapLayer(name): DBMapLayer {
        return new DBMapLayer(name);
    }

    // Roads
    public static CreateSingleMapRoad(
        points: LatLng[], elevation: number[],
        name?: string, color?: string, weight?: number,
        opacity?: number, smoothFactor?: number, dbID?: number
    ): SingleMapRoad {
        return new SingleMapRoad(points, elevation, name, color, weight, opacity, smoothFactor);
    }

    public static CreateMultiMapRoad(
        points: LatLng[][], elevation: number[][],
        name?: string, color?: string, weight?: number,
        opacity?: number, smoothFactor?: number, dbID?: number
    ): MultiMapRoad {
        return new MultiMapRoad(points, elevation, name, color, weight, opacity, smoothFactor);
    }

    public static CreateDBMultiMapRoad(dbID: number): DBMultiMapRoad {
        return new DBMultiMapRoad(dbID);
    }

    public static CreateDBSingleMapRoad(dbID: number): DBSingleMapRoad {
        return new DBSingleMapRoad(dbID);
    }

    // Markers
    public static CreateMapMarker(
        point: L.LatLng,
        popupMsg: string,
        name: string = "Bod",
        useCustomIcon: boolean = false,
        dbID: number = undefined
    ): MapMarker {
        return new MapMarker(point, popupMsg, name, useCustomIcon);
    }

    // Areas
    public static CreateMapArea(
        points: L.LatLng[],
        popupMsg: string,
        name: string = "Plocha",
        dbID: number = undefined
    ): MapArea {
        return new MapArea(points, popupMsg, name);
    }
}