export class FileLoader {
    constructor() {
        
    }

    public SpawnNameInput(containerId: string, addFunction: Function) {
        let container = document.getElementById(containerId);
        let input = container.children[0] as HTMLInputElement;
        input.setAttribute("type", "text");
        input.setAttribute("placeholder", "Název nové vrstvy");

        let addButton = document.createElement("button");
        addButton.setAttribute("class", "btn btn-outline-primary");
        addButton.setAttribute("type", "button");
        addButton.innerHTML = "Vložit";
        addButton.onclick = () => {
            addFunction(input.value);
            this.DestroyNameInput(container);
        }
        container.appendChild(addButton);

        let cancelButton = document.createElement("button");
        cancelButton.setAttribute("class", "btn btn-outline-danger");
        cancelButton.setAttribute("type", "button");
        cancelButton.innerHTML = "Zrušit";
        cancelButton.onclick = () => {
            this.DestroyNameInput(container);
        }
        container.appendChild(cancelButton);
    }

    private DestroyNameInput(container: HTMLElement) {
        let input = container.children[0] as HTMLInputElement;
        input.setAttribute("type", "file");
        input.removeAttribute("placeholder");

        container.removeChild(container.children[1]);
        container.removeChild(container.children[1]);
    }
}