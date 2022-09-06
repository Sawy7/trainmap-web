export abstract class MapEntity {
    protected name: string = "Entita";
    readonly className: string;
    readonly dbID: number;
    protected dontSerializeList: string[] = [];

    public constructor(dbID: number = undefined) {
        this.dbID = dbID;
    }

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
