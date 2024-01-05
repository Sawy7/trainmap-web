import { Modal } from "bootstrap";

export class LogNotify {
    public static ToggleLog() {
        let logModalElement = document.getElementById("logModal");

        if (!logModalElement.classList.contains("show")) {
            let logModal = new Modal(logModalElement);
            logModal.show();
        }
    }

    public static PushToLog(text: string) {
        let logBody = document.getElementById("logModalBody");
        let line = document.createElement("p");
        line.textContent = text;
        logBody.appendChild(line);
    } 

    public static PushAlert(message: string, linkVerbage?: string, linkFunction?: Function, type: string = "primary") {
        const alertPlace = document.getElementById("alertPlace");
        
        let alert = document.createElement("div");
        alert.setAttribute("class", `alert alert-${type} alert-dismissible`);
        alert.setAttribute("role", "alert");
        alert.textContent = message + " ";

        let dismissButton = document.createElement("button");
        dismissButton.setAttribute("type", "button");
        dismissButton.setAttribute("class", "btn-close");
        dismissButton.setAttribute("data-bs-dismiss", "alert");
        dismissButton.setAttribute("aria-label", "Close");

        if (linkVerbage !== undefined && linkFunction !== undefined) {
            let link = document.createElement("a");
            link.setAttribute("href", "#");
            link.setAttribute("class", "alert-link");
            link.setAttribute("id", "alertLink");
            link.setAttribute("data-bs-dismiss", "alert");
            link.textContent = linkVerbage;
            alert.appendChild(link);

            // Give the link a purpose
            link.onclick = (event) => {
                linkFunction();
            };
        }
        
        alert.appendChild(dismissButton);
        alertPlace.appendChild(alert);
    }

    public static ToggleThrobber() {
        let throbberOverlay = document.getElementById("throbberOverlay");
        let throbberMsg = document.getElementById("throbberMessage");
        if (throbberOverlay.style.display != "") {
            throbberOverlay.style.display = "";
        }
        else
            throbberOverlay.style.display = "none";
            throbberMsg.innerHTML = "";
    }

    public static UpdateThrobberMessage(message: string) {
        let throbberMsg = document.getElementById("throbberMessage");
        throbberMsg.textContent = message;
    }

    public static PlaceLoader(parentElement: HTMLElement, replace: boolean = false): HTMLElement {
        let loader = document.createElement("div");
        loader.setAttribute("class", "spinner-border spinner-border-sm");

        if (replace)
            parentElement.parentNode.replaceChild(loader, parentElement);
        else
            parentElement.appendChild(loader);
        return loader;
    }
}