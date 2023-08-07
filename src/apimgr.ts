import { ApiComms } from "./apicomms";

export class ApiMgr {
    // private static rootUrl: string = "http://rmap.vsb.cz/devapi";
    // private static rootUrl: string = "http://localhost:3000";
    private static rootUrl: string = "/api";

    public static OnlineDBCheck (): object {
        return JSON.parse(ApiComms.GetRequest(`${this.rootUrl}/onlinedbcheck.php`));
    }

    public static ListRails(): object {
        return JSON.parse(ApiComms.GetRequest(`${this.rootUrl}/listrails.php`));
    }

    public static ListOSMRails(): object {
        return JSON.parse(ApiComms.GetRequest(`${this.rootUrl}/listosmrails.php`));
    }

    public static GetRails(dbIDs: number[]): object {
        let requestJSON = {"relcisla": dbIDs};
        return JSON.parse(ApiComms.PostRequest(
            `${this.rootUrl}/getrails.php`,
            JSON.stringify(requestJSON)
        ));
    }

    public static GetOSMRails(dbIDs: number[]): object {
        let requestJSON = {"relcisla": dbIDs};
        return JSON.parse(ApiComms.PostRequest(
            `${this.rootUrl}/getosmrails.php`,
            JSON.stringify(requestJSON)
        ));
    }

    public static GetStations(dbIDs: number[]): object {
        let requestJSON = {"relcisla": dbIDs};
        return JSON.parse(ApiComms.PostRequest(
            `${this.rootUrl}/getstations.php`,
            JSON.stringify(requestJSON)
        ));
    }

    public static CalcConsumption(dbID: number): object {
        let requestJSON = {"relcislo": dbID};
        return JSON.parse(ApiComms.PostRequest(
            `${this.rootUrl}/calcconsumption.php`,
            JSON.stringify(requestJSON)
        ));
    }

    public static CalcConsumptionExt(
        railID: number, stationIDs: number[],
        massLocomotive: number, massWagon: number,
        powerLimit: number, recuperationCoef: number,
        isReversed: boolean
        ): object {
        let requestJSON = {
            "relcislo": railID,
            "station_ids": stationIDs,
            "mass_locomotive_kg": massLocomotive,
            "mass_wagon_kg": massWagon,
            "power_limit_kw": powerLimit,
            "recuperation_coef": recuperationCoef,
            "is_reversed": isReversed,
        };
        return JSON.parse(ApiComms.PostRequest(
            `${this.rootUrl}/calcconsumptionext.php`,
            JSON.stringify(requestJSON)
        ));
    }
}