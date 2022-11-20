import { Modal } from "bootstrap";

export class TrainPicker {
    static modalElement = document.getElementById("trainPickerModal");
    static showButton = document.getElementById("trainPickerButton");

    static SetInteraction() {
        this.showButton.onclick = () => {
            this.ToggleInterface();
        };
    }

    // TODO: Now immune to click-offs and keyboard. Make better mayhaps?
    static ToggleInterface(show: boolean = true) {
        let modal = new Modal(this.modalElement);
        if (show)
            modal.show();
        else {
            this.modalElement.classList.remove("show");
            let backdrop = document.getElementsByClassName("modal-backdrop")[0];
            backdrop.parentNode.removeChild(backdrop);
            this.modalElement.style.display = "none";
        }
    }
}