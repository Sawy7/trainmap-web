import { MapEntityFactory } from "./mapentityfactory";
import { MapMarker } from "./mapmarker";
import { MapWindow } from "./mapwindow";

export class MapWindowFull extends MapWindow {
    private activeElevationMarker: MapMarker;

    public RenderElevationMarker(point?: L.LatLng) {
        if (point === undefined) {
            if (this.activeElevationMarker === undefined)
                return;
            this.map.removeLayer(this.activeElevationMarker.GetMapEntity());
            this.activeElevationMarker = undefined;
            return;
        }

        if (this.activeElevationMarker === undefined) {
            this.activeElevationMarker = MapEntityFactory.CreateElevationMarker(point);
            this.activeElevationMarker.GetMapEntity().addTo(this.map);
        }
        else {
            this.activeElevationMarker.ChangeCoordinates(point);
        }
    }
}