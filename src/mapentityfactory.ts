import { LatLng } from "leaflet";
import { DBMapEntityCache } from "./dbentitycache";
import { DBMapLayer } from "./dblayer";
import { DBOSMMapRoad } from "./dbosmroad";
import { DBSingleMapRoad } from "./dbsingleroad";
import { GhostDBMapLayer } from "./ghostdblayer";
import { MapArea } from "./maparea";
import { MapLayer } from "./maplayer"
import { MapMarker } from "./mapmarker";
import { MultiMapRoad } from "./multiroad";
import { SingleMapRoad } from "./singleroad";
import { DBStationMapMarker } from "./dbstationmarker";

export class MapEntityFactory {
    // Layers
    public static CreateMapLayer(name: string, color?: string): MapLayer {
        return new MapLayer(name, color);
    }

    public static CreateDBMapLayer(name: string, color?: string): DBMapLayer {
        return new DBMapLayer(name, color);
    }

    public static CreateGhostDBMapLayer(name: string, elementInfoObjects: object[], color: string, id: number): DBMapLayer {
        return new GhostDBMapLayer(name, elementInfoObjects, color, id);
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

    public static CreateDBOSMMapRoad(dbID: number, geoJSON?: object): DBOSMMapRoad {
        return DBMapEntityCache.Instance.GetOSMMapRoad(dbID, geoJSON);
    }

    public static CreateDBSingleMapRoad(dbID: number, geoJSON?: object): DBSingleMapRoad {
        return DBMapEntityCache.Instance.GetDBSingleMapRoad(dbID, geoJSON);
    }

    // Markers
    public static CreateMapMarker(
        point: L.LatLng,
        popupMsg: string,
        name: string = "Bod",
        customIcon?: string,
        customIconSize?: number
    ): MapMarker {
        return new MapMarker(point, popupMsg, name, customIcon, customIconSize);
    }

    public static CreateElevationMarker(point: L.LatLng): MapMarker {
        return new MapMarker(point, "", "", "custom-assets/elevation-marker.svg", 14)
    }

    public static CreateDBStationMapMarker(geoJSON: object): DBStationMapMarker {
        return new DBStationMapMarker(geoJSON);
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