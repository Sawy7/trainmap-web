import { MapEntity } from "./mapentity";

export abstract class DBMapEntity extends MapEntity {
    protected dbID: number;
    protected wasRemoved: boolean;

    public GetLocalStorageObject(): object {
        return {
            "type": this.className,
            "id": this.dbID
        }
    }

    public CheckRemoved() {
        return this.wasRemoved;
    }
}