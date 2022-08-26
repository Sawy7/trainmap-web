import * as L from "leaflet";
import { SingleMapRoad } from "./singleroad";

export class RoadGroup {
    public points: L.LatLng[];
    public elevation: number[];
    public nextGroups: RoadGroup[] = [];
    public nextGroupPoints: number[] = [];
    public nextGroupConnects: number[] = [];
    public prevGroups: RoadGroup[] = [];
    public visited: number = 0;
    public merged: boolean = false;
    static globalIDGen: number = -1;
    readonly id: number;
    private thisIsNext: boolean = false;

    constructor(points: L.LatLng[], elevation: number[]) {
        this.points = points;
        this.elevation = elevation;
        this.id = ++RoadGroup.globalIDGen;
        this.FixElevation();
    }

    public AddNextGroup(group: RoadGroup, pointIndex: number, connectIndex: number = 0) {
        this.nextGroups.push(group);
        this.nextGroupPoints.push(pointIndex);
        this.nextGroupConnects.push(connectIndex);
    }

    public SetAndCheckThisNext(): boolean {
        let wasNext = this.thisIsNext;
        if (!this.thisIsNext)
            this.thisIsNext = true;
        return wasNext;
    }

    public GenerateUMLNodes(): string {
        let umlRelations = "";
        this.nextGroups.forEach(next => {
            umlRelations += "NODE_" + this.id + "_--|>" + "NODE_" + next.id + "_\n";
        });
        return umlRelations;
    }

    private ResetNext(callingGroup: RoadGroup) {
        if (callingGroup === undefined)
            return;

        for (let i = 0; i < this.nextGroups.length; i++) {
            let nextInside = this.nextGroups[i];
            if (nextInside === callingGroup) {
                // Adding [former previous] as [next]
                callingGroup.AddNextGroup(this, this.nextGroupConnects[i], this.nextGroupPoints[i]);
                // Removing [former next]
                this.nextGroups.splice(i, 1);
                this.nextGroupPoints.splice(i, 1);
                this.nextGroupConnects.splice(i, 1);
                // Adding [former next] as [previous]
                this.AddPrevGroup(callingGroup);
                break;
            }
        }
    }

    public NextFixNG(destinationGroup: RoadGroup, callingGroup?: RoadGroup): boolean {
        if (this === destinationGroup) {
            this.ResetNext(callingGroup);
            return true;
        }

        for (let i = 0; i < this.prevGroups.length; i++) {
            let prev = this.prevGroups[i];
            if (prev.NextFixNG(destinationGroup, this)) {
                this.ResetNext(callingGroup);
                // Removing [former previous]
                this.prevGroups.splice(i, 1);
                return true;
            }
        }

        return false;
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
            this.nextGroupPoints[i] = this.points.length - this.nextGroupPoints[i] - 1;
        }
    }

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

        if (fromIndex === undefined && toIndex === undefined) {
            fromIndex = 0;
            toIndex = this.points.length;
        }

        if (doubleUp && toIndex < this.points.length) {
            // Reversed
            for (let j = toIndex - 1; j >= fromIndex; j--) {
                constructedRoad.AddPoint(this.points[j], this.elevation[j]);
            }
        }

        for (let i = fromIndex; i < toIndex; i++) {
            let childFound = false;
            
            for (let j = 0; j < this.nextGroups.length; j++) {
                const child = this.nextGroups[j];
                const childPoint = this.nextGroupPoints[j];
                const connectPoint = this.nextGroupConnects[j];
                if (child.visited > 0) {
                    continue;
                } else if (i == childPoint) {
                    childFound = true;
                    if (connectPoint != 0) {
                        child.JoinIntersects(color, weight, opacity, smoothFactor, true, constructedRoad, 0, connectPoint);
                        child.JoinIntersects(color, weight, opacity, smoothFactor, true, constructedRoad, connectPoint, child.points.length);
                        child.visited--;  
                    } else {
                        child.JoinIntersects(color, weight, opacity, smoothFactor, true, constructedRoad);
                    }
                }
            }

            if (!childFound) {
                constructedRoad.AddPoint(this.points[i], this.elevation[i]);
            }
        }

        if (doubleUp && toIndex == this.points.length) {
            // Reversed
            for (let j = toIndex - 1; j >= fromIndex; j--) {
                constructedRoad.AddPoint(this.points[j], this.elevation[j]);
            }
        }

        if (!doubleUp) {
            return constructedRoad;
        }
    }

    public GetUndupedRoute(
        keepFactor: number = 10, throwIndex: number = 1,
        notRoot: boolean = false,
        undupedPoints: L.LatLng[] = [], undupedElevation: number[] = [],
        fromIndex?: number, toIndex?: number
    ): [L.LatLng[], number[]] {
        if (fromIndex === undefined && toIndex === undefined) {
            fromIndex = 0;
            toIndex = this.points.length;
        }

        if (notRoot && toIndex < this.points.length) {
            // Reversed
            for (let i = toIndex - 1; i >= fromIndex; i--) {
                throwIndex = this.PushPointsWithThrow(
                    keepFactor, throwIndex,
                    undupedPoints, undupedElevation, i
                );
            }
        }

        for (let i = fromIndex; i < toIndex; i++) {
            let childFound = false;
            
            for (let j = 0; j < this.nextGroups.length; j++) {
                const child = this.nextGroups[j];
                const childPoint = this.nextGroupPoints[j];
                const connectPoint = this.nextGroupConnects[j];
                if (i == childPoint) {
                    childFound = true;
                    if (connectPoint != 0) {
                        child.GetUndupedRoute(
                            keepFactor, throwIndex, true,
                            undupedPoints, undupedElevation,
                            0, connectPoint
                        );
                        child.GetUndupedRoute(
                            keepFactor, throwIndex, true,
                            undupedPoints, undupedElevation,
                            connectPoint, child.points.length
                        );
                    } else {
                        child.GetUndupedRoute(
                            keepFactor, throwIndex, true,
                            undupedPoints, undupedElevation
                        );
                    }
                }
            }

            if (childFound)
                continue;

            throwIndex = this.PushPointsWithThrow(
                keepFactor, throwIndex,
                undupedPoints, undupedElevation, i
            );
        }

        if (notRoot && toIndex == this.points.length) {
            // Reversed
            for (let i = toIndex - 1; i >= fromIndex; i--) {
                throwIndex = this.PushPointsWithThrow(
                    keepFactor, throwIndex,
                    undupedPoints, undupedElevation, i
                );
            }
        }

        if (!notRoot) {
            return [undupedPoints, undupedElevation];
        }
    }

    private PushPointsWithThrow(
        keepFactor: number, throwIndex: number,
        undupedPoints: L.LatLng[], undupedElevation: number[],
        pointIndex: number
    ): number {
        if (throwIndex == keepFactor) {
            undupedPoints.push(this.points[pointIndex]);
            undupedElevation.push(this.elevation[pointIndex]);
            throwIndex = 0;
        } else {
            throwIndex++;
        }

        return throwIndex;
    }

    private FixElevation() {
        for (let i = 0; i < this.elevation.length; i++) {
            if (this.elevation[i] == 0) {
                let nonZeroFound = false;
                for (let j = i+1; j < this.elevation.length; j++) {
                    if (this.elevation[j] != 0)
                        this.elevation[i] = this.elevation[j];
                        nonZeroFound = true;
                        break;
                }

                if (nonZeroFound)
                    continue;

                for (let j = i-1; j >= 0; j--) {
                    if (this.elevation[j] != 0)
                        this.elevation[i] = this.elevation[j];
                        nonZeroFound = true;
                        break;
                }

                if (nonZeroFound)
                    continue;
            }
        }
    }
}