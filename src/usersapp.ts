// External imports
import { Collapse } from 'bootstrap';

// Internal imports
import { FormUtilities } from './formutilities';
import { UsersApiMgr } from './usersapimgr';

export class UsersApp {
    // Segments
    private userList: HTMLDivElement;
    private dynamicSegments = ["operationsPlaceholder", "editOperations", "newUserOperations"]
    // Buttons
    private submitButtonNew: HTMLButtonElement;
    private submitButtonEdit: HTMLButtonElement;
    // Inputs
    private emailInputNew: HTMLInputElement;
    private passwordInputNew: HTMLInputElement;
    private passwordAgainInputNew: HTMLInputElement;
    private passwordInputEdit: HTMLInputElement;
    private passwordAgainInputEdit: HTMLInputElement;
    // General variables
    private chosenUser: HTMLLinkElement;
    private static _instance: UsersApp;

    private constructor() {};

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    public Init() {
        this.SetupButtons();
        this.SetupValidation();
    }
    
    private SetupButtons() {
        // Existing users
        this.userList = document.getElementById("userList") as HTMLDivElement; 
        for (let i = 0; i < this.userList.childElementCount; i++) {
            const userButton = this.userList.children[i] as HTMLLinkElement;
            userButton.onclick = () => {
                this.UserButtonOnClick(userButton);
            };
        }

        // New user
        let addUserButton = document.getElementById("addUserButton") as HTMLLinkElement; 
        addUserButton.onclick = () => {
            this.DeactivateAllUserButtons();
            this.ShowPageSegment("newUserOperations")
        };

        // Delete user
        let delUserButton = document.getElementById("delUserButton") as HTMLLinkElement;
        delUserButton.onclick = () => {
            let result = UsersApiMgr.DeleteUser(this.chosenUser.children[0].innerHTML);
            console.log(result);
            if (result["type"] !== "success") {
                console.log("Error"); // TODO: Some notification would be nice
                return;
            }
            this.chosenUser.remove();
            this.chosenUser = undefined;
            this.ShowPageSegment("operationsPlaceholder");
        };

        // ChangeRole
        let roleRadios = [
            {"element": "radioNormal", "mask": 0, "pill": "user-pill"},
            {"element": "radioAdmin", "mask": 1, "pill": "admin-pill"},
        ];
        roleRadios.forEach(rr => {
            let element = document.getElementById(rr["element"]);
            element.onclick = () => {
                let result = UsersApiMgr.ChangeRole(this.chosenUser.children[0].innerHTML, rr["mask"]);
                if (result["type"] !== "success") {
                    console.log("Error"); // TODO: Some notification would be nice
                    return;
                }
                this.chosenUser.setAttribute("value", rr["mask"].toString());
                let prevPills = this.chosenUser.children;
                for (let element of prevPills) {
                    if (element.classList.contains("rounded-pill"))
                        element.remove();
                }
                let rolePill = document.getElementsByClassName(rr["pill"])[0].cloneNode(true) as HTMLElement;
                rolePill.setAttribute("style", "");
                this.chosenUser.appendChild(rolePill);

                let delUserButton = document.getElementById("delUserButton") as HTMLLinkElement;
                delUserButton.disabled = rr["mask"] === 1;
            };
        });
    }

    private ShowPageSegment(segmentName: string) {
        this.dynamicSegments.forEach(dSeg => {
            if (segmentName === dSeg)
                document.getElementById(dSeg).setAttribute("style", "");
            else
                document.getElementById(dSeg).setAttribute("style", "display: none");
        });
    }
    
    private SetupValidation() {
        this.emailInputNew = document.getElementById("emailNew") as HTMLInputElement;
        this.passwordInputNew = document.getElementById("passwordNew") as HTMLInputElement;
        this.passwordAgainInputNew = document.getElementById("passwordAgainNew") as HTMLInputElement;
        this.submitButtonNew = document.getElementById("submitButtonNew") as HTMLButtonElement;
        this.passwordInputEdit = document.getElementById("passwordEdit") as HTMLInputElement;
        this.passwordAgainInputEdit = document.getElementById("passwordAgainEdit") as HTMLInputElement;
        this.submitButtonEdit = document.getElementById("submitButtonEdit") as HTMLButtonElement;

        // Actual validation
        this.passwordInputNew.onkeyup = () => {
            FormUtilities.ValidatePassword(this.passwordInputNew, this.passwordAgainInputNew, this.submitButtonNew);
        };
        this.passwordAgainInputNew.onkeyup = () => {
            FormUtilities.ValidatePassword(this.passwordInputNew, this.passwordAgainInputNew, this.submitButtonNew);
        };

        this.passwordInputEdit.onkeyup = () => {
            FormUtilities.ValidatePassword(this.passwordInputEdit, this.passwordAgainInputEdit, this.submitButtonEdit);
        };
        this.passwordAgainInputEdit.onkeyup = () => {
            FormUtilities.ValidatePassword(this.passwordInputEdit, this.passwordAgainInputEdit, this.submitButtonEdit);
        };

        // Sending forms
        this.submitButtonNew.onclick = () => {
            let result = UsersApiMgr.AddUser(this.emailInputNew.value, this.passwordInputNew.value);
            if (result["type"] !== "success") {
                console.log("Error"); // TODO: Some notification would be nice
                return;
            }
            this.AddNewUserToList(this.emailInputNew.value);
            // Show empty screen
            this.ShowPageSegment("operationsPlaceholder")
            // Clear inputs
            this.emailInputNew.value = "";
            this.passwordInputNew.value = "";
            this.passwordAgainInputNew.value = "";
        };

        this.submitButtonEdit.onclick = () => {
            let result = UsersApiMgr.ChangePassword(this.chosenUser.children[0].innerHTML, this.passwordInputEdit.value);
            if (result["type"] !== "success") {
                console.log("Error"); // TODO: Some notification would be nice
                return;
            }
            // Clear inputs
            this.passwordInputEdit.value = "";
            this.passwordAgainInputEdit.value = "";
        };
    }

    private UserButtonOnClick(userButton: HTMLLinkElement) {
        if (this.chosenUser === userButton)
            return;

        // Set edit according to admin/non-admin
        let delUserButton = document.getElementById("delUserButton") as HTMLLinkElement;
        let userRole = parseInt(userButton.getAttribute("value"));
        delUserButton.disabled = userRole === 1;
        let radioName: string;
        if (userRole == 0)
            radioName = "radioNormal";
        else if (userRole == 1)
            radioName = "radioAdmin";
        let radioToEnable = document.getElementById(radioName) as HTMLInputElement;
        radioToEnable.checked = true;

        this.ShowPageSegment("editOperations");
        this.DeactivateAllUserButtons();
        this.chosenUser = userButton;
        userButton.classList.add("active");
    }

    private DeactivateAllUserButtons() {
        for (let i = 0; i < this.userList.childElementCount; i++) {
            const userButton = this.userList.children[i] as HTMLLinkElement;
            userButton.classList.remove("active");
        }
        this.chosenUser = undefined;
    }

    private AddNewUserToList(email: string) {
        let newUserEntry = this.userList.children[0].cloneNode(true) as HTMLLinkElement;
        newUserEntry.children[0].textContent = email;
        newUserEntry.children[1].remove();
        newUserEntry.setAttribute("value", "0");

        let rolePill = document.getElementsByClassName("user-pill")[0].cloneNode(true) as HTMLElement;
        rolePill.setAttribute("style", "");
        newUserEntry.appendChild(rolePill);

        newUserEntry.onclick = () => {
            this.UserButtonOnClick(newUserEntry);
        };
        this.userList.appendChild(newUserEntry);
    }
}