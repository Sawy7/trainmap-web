export abstract class MapEntity {
    protected name: string = "Entita";
    readonly className: string;
    protected dontSerializeList: string[] = [];

    public abstract GetMapEntity(): any;
    public abstract GetSignificantPoint(): L.LatLng;
    
    public GetListInfo(): string {
        return this.name;
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
