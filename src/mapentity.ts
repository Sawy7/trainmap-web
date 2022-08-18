export abstract class MapEntity {
    readonly className: string;
    protected dontSerializeList: string[] = [];

    public abstract GetMapEntity(): any;
    public abstract GetListInfo(): string;
    public abstract GetSignificantPoint(): L.LatLng;

    public Serialize(): Object {
        let toBeSerialized = this;
        Object.entries(toBeSerialized).map(item => {
            if (this.dontSerializeList.includes(item[0]))
                delete toBeSerialized[item[0]];
        })
        return toBeSerialized;
    }
}
