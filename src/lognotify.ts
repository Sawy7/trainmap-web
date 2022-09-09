import { Modal } from "bootstrap";
import { App } from "./app";

export class LogNotify {
    public static Init() {
        // Key combo
        document.addEventListener("keydown", (event) => {
            if (event.code == "Backquote")
                this.ToggleLog();
        }, false);

        // Save button
        document.getElementById("logModalSaveButton").onclick = () => {
            this.SaveLogToDisk();
        };
    }

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
        line.innerHTML = text;
        logBody.appendChild(line);
    } 

    // https://stackoverflow.com/questions/8178825/create-text-file-in-javascript
    private static SaveLogToDisk() {
        let logLines = document.getElementById("logModalBody").children;
        let text: string = "";
        
        for (let i = 0; i < logLines.length; i++) {
            const line = logLines[i].innerHTML;
            text += line + "\n";
        }

        App.Instance.SaveTextToDisk(text, "log.txt", "text/plain");
    }

    public static PushAlert(message: string, linkVerbage?: string, linkFunction?: Function, type: string = "primary") {
        const alertPlace = document.getElementById("alertPlace");
        
        let alert = document.createElement("div");
        alert.setAttribute("class", `alert alert-${type} alert-dismissible`);
        alert.setAttribute("role", "alert");
        alert.innerHTML = message + " ";

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
            link.innerHTML = linkVerbage;
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
        if (throbberOverlay.style.display != "") {
            throbberOverlay.style.display = "";
        }
        else
            throbberOverlay.style.display = "none";
    }
}