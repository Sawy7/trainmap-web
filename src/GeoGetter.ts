import { ApiMgr } from "./apimgr";
import { DBOSMMapRoad } from "./dbosmroad";
import { MapEntityFactory } from "./mapentityfactory";

export class GeoGetter {
    private static GetGeneric(dbIDs: number[], get: Function, create: Function) {
        if (dbIDs.length == 0)
            return [];

        let mapRoads: DBOSMMapRoad[] = [];

        get(dbIDs)["features"].forEach(osmRail => {
            mapRoads.push(create(
                osmRail["properties"]["relcislo"],
                osmRail
            ));
        });

        return mapRoads;
    }

    public static GetOSMRails(dbIDs: number[]): DBOSMMapRoad[] {
        return GeoGetter.GetGeneric(
            dbIDs,
            ApiMgr.GetOSMRails.bind(ApiMgr),
            MapEntityFactory.CreateDBOSMMapRoad.bind(MapEntityFactory)
        );
    }
}