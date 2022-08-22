import * as L from "leaflet";
import { SingleMapRoad } from "./singleroad";

export class RoadGroup {
    public points: L.LatLng[];
    public elevation: number[];
    private nextGroups: RoadGroup[] = [];
    private nextGroupPoints: number[] = [];
    private prevGroups: RoadGroup[] = [];

    constructor(points: L.LatLng[], elevation: number[]) {
        this.points = points;
        this.elevation = elevation;
    }

    public AddNextGroup(group: RoadGroup, pointIndex: number) {
        this.nextGroups.push(group);
        this.nextGroupPoints.push(pointIndex);
    }

    public AddPrevGroup(group: RoadGroup) {
        this.prevGroups.push(group);
    }

    public GetNextCount(): number {
        return this.nextGroups.length;
    }

    public GetPrevCount(): number {
        return this.prevGroups.length;
    }

    // TODO: Add road props (color, weight, ...)
    public JoinIntersects(
        doubleUp: boolean = false, previouslyVisited: RoadGroup[] = [],
        constructedRoad: SingleMapRoad = new SingleMapRoad([], [])
    ) {
        previouslyVisited.push(this);

        for (let i = 0; i < this.points.length; i++) {
            let childFound = false;
            
            for (let j = 0; j < this.nextGroups.length; j++) {
                const child = this.nextGroups[j];
                const childPoint = this.nextGroupPoints[j];
                if (previouslyVisited.includes(child)) {
                    continue;
                } else if (i == childPoint) {
                    childFound = true;
                    previouslyVisited.push(child);
                    child.JoinIntersects(true, previouslyVisited, constructedRoad);
                }
            }

            if (!childFound) {
                constructedRoad.AddPoint(this.points[i], this.elevation[i]);
            }
        }
        if (doubleUp) {
            // Reversed
            for (let j = this.points.length - 1; j >= 0; j--) {
                constructedRoad.AddPoint(this.points[j], this.elevation[j]);
            }
        } else {
            return constructedRoad;
        }
    }
}