import { ApiComms } from "./apicomms";

export class Overpass {
    private static url: string = "https://lz4.overpass-api.de/api/interpreter";

    constructor() {}

    public static GetRailtrack() {
        let query = '[out:json][timeout:25]; \
        ( \
          relation["route"="tracks"]["ref"=321]; \
          (._;>>;); \
        ); \
        out body;';

        let apiJSON = JSON.parse(ApiComms.PostRequest(Overpass.url, query));
        
        apiJSON["elements"].forEach(element => {
            if (element["type"] == "node")
                console.log(element);
        });
    }
}
