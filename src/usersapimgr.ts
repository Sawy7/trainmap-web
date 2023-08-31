import { ApiComms } from "./apicomms";

export class UsersApiMgr {
    private static rootUrl: string = "/admin/usersapi";

    public static AddUser(email: string, password: string): object {
        return JSON.parse(ApiComms.PostRequestURLEncoded(
            `${this.rootUrl}/adduser.php`,
            {"email": email, "password": password}
        ));
    }

    public static DeleteUser(email: string): object {
        return JSON.parse(ApiComms.PostRequestURLEncoded(
            `${this.rootUrl}/deluser.php`,
            {"email": email}
        ));
    }

    public static ChangePassword(email: string, password: string): string {
        return JSON.parse(ApiComms.PostRequestURLEncoded(
            `${this.rootUrl}/changepass.php`,
            {"email": email, "password": password}
        ));
    }

    public static ChangeRole(email: string, role: number): object {
        return JSON.parse(ApiComms.PostRequestURLEncoded(
            `${this.rootUrl}/changerole.php`,
            {"email": email, "role": role}
        ));
    }
}