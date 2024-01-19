import { ApiComms } from "./apicomms";

export class UsersApiMgr {
    private static rootAdminUrl: string = "/admin/adminapi";
    private static rootUsersUrl: string = "/admin/usersapi";

    public static AddUser(email: string, password: string): object {
        return JSON.parse(ApiComms.PostRequestURLEncoded(
            `${this.rootAdminUrl}/adduser.php`,
            {"email": email, "password": password}
        ));
    }

    public static DeleteUser(email: string): object {
        return JSON.parse(ApiComms.PostRequestURLEncoded(
            `${this.rootAdminUrl}/deluser.php`,
            {"email": email}
        ));
    }

    public static ChangePassword(email: string, password: string): string {
        return JSON.parse(ApiComms.PostRequestURLEncoded(
            `${this.rootAdminUrl}/changepass.php`,
            {"email": email, "password": password}
        ));
    }

    public static ChangeRole(email: string, role: number): object {
        return JSON.parse(ApiComms.PostRequestURLEncoded(
            `${this.rootAdminUrl}/changerole.php`,
            {"email": email, "role": role}
        ));
    }

    public static ChangePasswordUser(oldPassword: string, newPassword:string): object {
        console.log("yoo");
        return JSON.parse(ApiComms.PostRequestURLEncoded(
            `${this.rootUsersUrl}/changepass.php`,
            {"oldpassword": oldPassword, "newpassword": newPassword}
        ));
    }
}