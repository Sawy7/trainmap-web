export class TrainCard {
    private name: string;
    readonly massLocomotive: number;
    readonly massWagon: number;
    readonly powerLimit: number;
    private image: string;
    private state: boolean;
    private cardElement: HTMLElement;
    private cardLink: HTMLAnchorElement;

    public constructor(
        name: string,
        massLocomotive: number,
        massWagon: number,
        powerLimit: number,
        image: string
    ) {
        this.name = name;
        this.massLocomotive = massLocomotive;
        this.massWagon = massWagon;
        this.powerLimit = powerLimit;
        this.image = image;
        this.state = false;
    }

    public GetCardElement(): HTMLElement {
        if (this.cardElement !== undefined)
            return this.cardElement;

        this.cardElement = document.createElement("div");
        this.cardElement.setAttribute("class", "card card-gray-dark text-light");

        let cardImage = document.createElement("img");
        cardImage.setAttribute("src", this.image);
        cardImage.setAttribute("class", "card-img-top");
        this.cardElement.appendChild(cardImage);

        let cardBody = document.createElement("div");
        cardBody.setAttribute("class", "card-body");

        let cardTitle = document.createElement("h5");
        cardTitle.setAttribute("class", "card-title");
        cardTitle.innerHTML = this.name;
        cardBody.appendChild(cardTitle);

        let cardText = document.createElement("p");
        cardText.setAttribute("class", "card-text");

        let massBadge = document.createElement("span");
        massBadge.setAttribute("class", "badge bg-danger");
        massBadge.innerHTML = "Hmotnost ";

        let massIcon = document.createElement("i");
        massIcon.setAttribute("class", "bi-train-front-fill");
        massBadge.appendChild(massIcon);

        cardText.appendChild(massBadge);
        cardText.innerHTML += ` ${this.massLocomotive}`;
        if (this.massWagon > 0)
            cardText.innerHTML += ` + ${this.massWagon}`;
        cardText.innerHTML += " kg<br>";

        let powerBadge = document.createElement("span");
        powerBadge.setAttribute("class", "badge bg-danger");
        powerBadge.innerHTML = "Max výkon ";

        let powerIcon = document.createElement("i");
        powerIcon.setAttribute("class", "bi-fuel-pump-fill");
        powerBadge.appendChild(powerIcon);

        cardText.appendChild(powerBadge);
        cardText.innerHTML += ` ${this.powerLimit}`;
        cardText.innerHTML += " kW";

        this.cardLink = document.createElement("a");
        this.cardLink.setAttribute("href", "#");
        this.cardLink.setAttribute("class", "stretched-link");

        cardBody.appendChild(cardText);
        cardBody.appendChild(this.cardLink);
        this.cardElement.appendChild(cardBody);

        return this.cardElement;
    }

    public GetState() {
        return this.state;
    }

    public ToggleCard(newState: boolean) {
        this.state = newState;
        if (this.state)
            this.cardElement.setAttribute("class", "card text-bg-primary");
        else
            this.cardElement.setAttribute("class", "card card-gray-dark text-light");
    }

    public RegisterToggleAction(actionFunction: Function) {
        this.cardLink.onclick = (e) => {

            actionFunction();
        };
    }
}