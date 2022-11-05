import { ApiComms } from "./apicomms";

export class ApiMgr {
    // private static rootUrl: string = "http://localhost:3000";
    private static rootUrl: string = "/api";

    public static ListElements(): object {
        return JSON.parse(ApiComms.GetRequest(`${this.rootUrl}/listelements.php`));
    }

    public static ListRails(): object {
        return JSON.parse(ApiComms.GetRequest(`${this.rootUrl}/listrails.php`));
    }

    public static ListOSMRails(): object {
        return JSON.parse(ApiComms.GetRequest(`${this.rootUrl}/listosmrails.php`));
    }

    public static GetElement(dbID: number): object {
        return JSON.parse(ApiComms.GetRequest(`${this.rootUrl}/getelement.php?id=${dbID}`));
    }

    public static GetElements(dbIDs: number[]): object {
        let requestJSON = {"ids": dbIDs};
        return JSON.parse(ApiComms.PostRequest(
            `${this.rootUrl}/getelements.php`,
            JSON.stringify(requestJSON)
        ));
    }

    public static GetRail(dbID: number): object {
        return JSON.parse(ApiComms.GetRequest(`${this.rootUrl}/getrail.php?relcislo=${dbID}`));
    }

    public static GetRails(dbIDs: number[]): object {
        let requestJSON = {"relcisla": dbIDs};
        return JSON.parse(ApiComms.PostRequest(
            `${this.rootUrl}/getrails.php`,
            JSON.stringify(requestJSON)
        ));
    }

    public static GetOSMRail(dbID: number): object {
        return JSON.parse(ApiComms.GetRequest(`${this.rootUrl}/getosmrail.php?relcislo=${dbID}`));
    }

    public static GetOSMRails(dbIDs: number[]): object {
        let requestJSON = {"relcisla": dbIDs};
        return JSON.parse(ApiComms.PostRequest(
            `${this.rootUrl}/getosmrails.php`,
            JSON.stringify(requestJSON)
        ));
    }

    public static GetGIDs(dbID: number): object {
        return JSON.parse(ApiComms.GetRequest(`${this.rootUrl}/getgids.php?id=${dbID}`));
    }

    public static GetLineator(id: number): object {
        return JSON.parse(ApiComms.GetRequest(`${this.rootUrl}/getlineator.php?id=${id}`));
    }
}