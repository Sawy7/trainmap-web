export class TrainCard {
    private name: string;
    readonly params: object;
    readonly variableParams: object;
    private image: string;
    private state: boolean;
    private cardElement: HTMLElement;
    private cardLink: HTMLAnchorElement;

    public constructor(
        name: string,
        params: object,
        variableParams: object,
        image: string
    ) {
        this.name = name;
        this.params = params;
        this.variableParams = variableParams;
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
        cardTitle.textContent = this.name;
        cardBody.appendChild(cardTitle);

        let cardText = document.createElement("p");
        cardText.setAttribute("class", "card-text");

        let massBadge = document.createElement("span");
        massBadge.setAttribute("class", "badge bg-danger");
        massBadge.textContent = "Hmotnost ";

        let massIcon = document.createElement("i");
        massIcon.setAttribute("class", "bi-train-front-fill");
        massBadge.appendChild(massIcon);

        cardText.appendChild(massBadge);
        cardText.appendChild(document.createTextNode(` ${this.params["mass_locomotive"]}`));
        if (this.params["mass_wagon"] > 0)
            cardText.appendChild(document.createTextNode(` + ${this.params["mass_wagon"]}`));
        cardText.appendChild(document.createTextNode(" kg"));
        cardText.appendChild(document.createElement("br"));

        let powerBadge = document.createElement("span");
        powerBadge.setAttribute("class", "badge bg-danger");
        powerBadge.textContent = "Max výkon ";

        let powerIcon = document.createElement("i");
        powerIcon.setAttribute("class", "bi-fuel-pump-fill");
        powerBadge.appendChild(powerIcon);

        cardText.appendChild(powerBadge);
        cardText.appendChild(document.createTextNode(` ${this.params["power_limit"]} kW`));

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

    public GetVehicleParamsObj() {
        return {}
    }
}