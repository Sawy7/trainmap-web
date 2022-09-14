import { ApiComms } from "./apicomms";

export class ApiMgr {
    private static rootUrl: string = "http://localhost:3000";
    // private static rootUrl: string = "${window.location.protocol}//${window.location.host}";

    public static ListElements(): object {
        return JSON.parse(ApiComms.GetRequest(`${this.rootUrl}/listelements.php`));
    }

    public static ListRails(): object {
        return JSON.parse(ApiComms.GetRequest(`${this.rootUrl}/listrails.php`));
    }

    public static GetElement(dbID: number): object {
        return JSON.parse(ApiComms.GetRequest(`${this.rootUrl}/getelement.php?id=${dbID}`));
    }

    public static GetRail(dbID: number): object {
        return JSON.parse(ApiComms.GetRequest(`${this.rootUrl}/getrail.php?relcislo=${dbID}`));
    }

    public static GetGIDs(dbID: number): object {
        return JSON.parse(ApiComms.GetRequest(`${this.rootUrl}/getgids.php?id=${dbID}`));
    }

    public static GetLineator(id: number): object {
        return JSON.parse(ApiComms.GetRequest(`${this.rootUrl}/getlineator.php?id=${id}`));
    }
}