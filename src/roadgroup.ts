import * as L from "leaflet";
import { SingleMapRoad } from "./singleroad";

export class RoadGroup {
    public points: L.LatLng[];
    public elevation: number[];
    public nextGroups: RoadGroup[] = [];
    public nextGroupPoints: number[] = [];
    public prevGroups: RoadGroup[] = [];
    public visited: number = 0;
    public merged: boolean = false;
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

    public GetExtremePoints(extremes: [L.LatLng, RoadGroup, number][]) {
        extremes.push([this.points[0], this, 0]);
        extremes.push([this.points[this.points.length-1], this, this.points.length-1]);
        this.nextGroups.forEach(next => {
            next.GetExtremePoints(extremes);
        });
    }

    public IsGroupNext(group: RoadGroup): boolean {
        let nextNested = this.nextGroups.some((next) => {
            return next.IsGroupNext(group);
        });
        return this.nextGroups.includes(group) || nextNested;
    }

    public IsGroupMerged(): boolean {
        let nextNested = this.nextGroups.some((next) => {
            return next.IsGroupMerged();
        });
        return this.merged || nextNested;
    }

    public SwapPointOrder() {
        this.points = this.points.reverse();
        this.elevation = this.elevation.reverse();
        
        for (let i = 0; i < this.nextGroupPoints.length; i++) {
            this.nextGroupPoints[i] = this.points.length - this.nextGroupPoints[i];
        }
    }

    // public IsGroupPrev(group: RoadGroup): boolean {
    //     return this.prevGroups.includes(group);
    // }

    public GetNearestPoint(foreignPoint: L.LatLng): [number, number] {
        let minDistance: number;
        let minIndex: number;
        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            let distance = RoadGroup.CalcPointsDistance(point, foreignPoint);
            if (minDistance === undefined || distance < minDistance) {
                minDistance = distance;
                minIndex = i;
            }
        }

        return [minDistance, minIndex];
    }

    // http://www.movable-type.co.uk/scripts/latlong.html
    public static CalcPointsDistance(pointA: L.LatLng, pointB: L.LatLng): number {
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

    public JoinIntersects(
        color?: string, weight?: number, opacity?: number, smoothFactor?: number,
        doubleUp: boolean = false,
        constructedRoad: SingleMapRoad = new SingleMapRoad([], [], color, weight, opacity, smoothFactor),
        fromIndex?: number, toIndex?: number
    ) {
        this.visited++;
        

        for (let i = 0; i < this.points.length; i++) {
            let childFound = false;

            
            for (let j = 0; j < this.nextGroups.length; j++) {
                const child = this.nextGroups[j];
                const childPoint = this.nextGroupPoints[j];
                if (child.visited > 0) {
                    continue;
                } else if (i == childPoint) {
                    childFound = true;
                    child.JoinIntersects(color, weight, opacity, smoothFactor, true, constructedRoad);
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