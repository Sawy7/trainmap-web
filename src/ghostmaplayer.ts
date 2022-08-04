import { MapLayer } from "./maplayer";

export class GhostMapLayer {
    public layerName: string;
    private layerLink: string;

    public constructor(name: string, link: string) {
        this.layerName = name;
        this.layerLink = link;
    }

    public Download(): MapLayer {
        return new MapLayer(this.layerName);
    }
}
