import { LocalLayer } from "./locallayer";

export class GhostMapLayer {
    public layerName: string;
    private layerLink: string;

    public constructor(name: string, link: string) {
        this.layerName = name;
        this.layerLink = link;
    }

    public Download(): LocalLayer {
        return new LocalLayer(this.layerName);
    }
}
