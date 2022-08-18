export abstract class MapEntity {
    readonly className: string;

    public abstract GetMapEntity(): any;
    public abstract GetListInfo(): string;
    public abstract GetSignificantPoint(): L.LatLng;

    public Serialize(): Object {
        return this;
    }
}
