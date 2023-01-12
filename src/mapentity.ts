export abstract class MapEntity {
    protected name: string = "Entita";
    protected linkIconName: string;
    readonly className: string;
    protected dontSerializeList: string[] = [];

    public abstract GetMapEntity(): any;
    public abstract GetSignificantPoint(): L.LatLng;
    
    public GetListInfo(): string {
        return this.name;
    }

    public GetLink(warpMethod: Function): HTMLElement {
        var entityLink = document.createElement("a");
        entityLink.setAttribute("class", "list-group-item list-group-item-dark d-flex justify-content-between align-items-center");
        entityLink.setAttribute("href", "#");
        
        let significantPoint = this.GetSignificantPoint();
        entityLink.innerHTML = this.name;

        if (this.linkIconName !== undefined) {
            var locateIcon = document.createElement("i");
            // entityLink.innerHTML = `<b>${entityLink.innerHTML}</b>`;
            locateIcon.setAttribute("class", this.linkIconName);
            entityLink.onclick = () => {
                warpMethod(significantPoint);
            };

            var badge = document.createElement("span");
            badge.appendChild(locateIcon);
            badge.setAttribute("class", "badge bg-primary rounded-pill");
            entityLink.appendChild(badge);
        }

        return entityLink;
    }

    public Serialize(): Object {
        let toBeSerialized = Object.assign({}, this);
        Object.entries(toBeSerialized).map(item => {
            if (this.dontSerializeList.includes(item[0]))
                delete toBeSerialized[item[0]];
        })
        return toBeSerialized;
    }
}
