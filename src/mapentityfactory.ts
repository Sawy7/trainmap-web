import { LatLng } from "leaflet";
import { DBMapEntityCache } from "./dbentitycache";

import { DBMapLayer } from "./dblayer";
import { DBMultiMapRoad } from "./dbmultiroad";
import { DBSingleMapRoad } from "./dbsingleroad";
import { GhostDBMapLayer } from "./ghostdblayer";
import { MapArea } from "./maparea";
import { MapLayer } from "./maplayer"
import { MapMarker } from "./mapmarker";
import { MultiMapRoad } from "./multiroad";
import { SingleMapRoad } from "./singleroad";

export class MapEntityFactory {
    // Layers
    public static CreateMapLayer(name: string, color?: string): MapLayer {
        return new MapLayer(name, color);
    }

    public static CreateDBMapLayer(name: string, color?: string): DBMapLayer {
        return new DBMapLayer(name, color);
    }

    public static CreateGhostDBMapLayer(name: string, elementInfoObjects: object[], color?: string): DBMapLayer {
        return new GhostDBMapLayer(name, elementInfoObjects, color);
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
        return DBMapEntityCache.Instance.GetDBMultiMapRoad(dbID);
    }

    public static CreateDBSingleMapRoad(dbID: number): DBSingleMapRoad {
        return DBMapEntityCache.Instance.GetDBSingleMapRoad(dbID);
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