import * as L from "leaflet";
import { SingleMapRoad } from "./singleroad";

export class RoadGroup {
    public points: L.LatLng[];
    public elevation: number[];
    private nextGroups: RoadGroup[] = [];
    private nextGroupPoints: number[] = [];
    private prevGroups: RoadGroup[] = [];
    public visited: boolean = false;
    static globalIDGen: number = -1;
    readonly id: number;

    constructor(points: L.LatLng[], elevation: number[]) {
        this.points = points;
        this.elevation = elevation;
        this.id = ++RoadGroup.globalIDGen;
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

    public IsGroupNext(group: RoadGroup): boolean {
        let nextNested = this.nextGroups.some((next) => {
            return next.IsGroupNext(group);
        });
        return this.nextGroups.includes(group) || nextNested;
    }

    // public IsGroupPrev(group: RoadGroup): boolean {
    //     return this.prevGroups.includes(group);
    // }

    public GetNearestPoint(foreignPoint: L.LatLng): [number, number] {
        let minDistance: number;
        let minIndex: number;
        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            let distance = this.CalcPointsDistance(point, foreignPoint);
            if (minDistance === undefined || distance < minDistance) {
                minDistance = distance;
                minIndex = i;
            }
        }

        return [minDistance, minIndex];
    }

    // http://www.movable-type.co.uk/scripts/latlong.html
    private CalcPointsDistance(pointA: L.LatLng, pointB: L.LatLng): number {
        const R = 6371e3; // metres
        const φ1 = pointA.lat * Math.PI/180; // φ, λ in radians
        const φ2 = pointB.lat * Math.PI/180;
        const Δφ = (pointB.lat-pointA.lat) * Math.PI/180;
        const Δλ = (pointB.lng-pointA.lng) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c; // in metres
    }

    public GetAsSingleMapRoad(): SingleMapRoad {
        return new SingleMapRoad(this.points, this.elevation);
    }

    // TODO: Add road props (color, weight, ...)
    public JoinIntersects(
        doubleUp: boolean = false, previouslyVisited: RoadGroup[] = [],
        constructedRoad: SingleMapRoad = new SingleMapRoad([], [])
    ) {
        previouslyVisited.push(this);
        this.visited = true;

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