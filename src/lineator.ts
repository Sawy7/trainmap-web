import { RoadGroup } from "./roadgroup";
import { SingleMapRoad } from "./singleroad";

export class Lineator {
    private roadGroups: RoadGroup[];
    private constructedRoads: SingleMapRoad[] = [];
    private rootGroup: RoadGroup;
    private isInitialized: boolean = false;

    constructor(roadGroups: RoadGroup[]) {
        this.roadGroups = roadGroups;
        // NOTE: Debug info
        // console.log("isolated count:", this.FindIsolated().length);

        // noParent.forEach(rg => {
        //     let randomColor = "#" + Math.floor(Math.random()*16777215).toString(16);
        //     this.constructedRoads.push(rg.JoinIntersects());
        // });

        // this.GenerateChartPoints(noParent[0]);

        // // NOTE: Debug info
        // this.GenerateChartPoints();
        // this.roadGroups.forEach(element => {
        //     console.log("visited:", element.visited, element.id);
        // });
        // console.log("nopar count:", noParent.length);
        // console.log("all groups count:", this.roadGroups.length);

        // console.log(this.GenerateUMLDiagram());
    }

    public Init() {
        if (this.isInitialized)
            return;

        this.JoinIsolated();

        // TODO: Add exhaustion check
        let noParent: RoadGroup[];
        while (true) {
            this.JoinHierarchies();
            noParent = this.FindNoParent();
            if (noParent.length == 1)
                break
        }
        this.rootGroup = noParent[0];
        this.isInitialized = true;
    }

    public CheckInit(): boolean {
        return this.isInitialized;
    }

    public GetPoints(): L.LatLng[][] {
        let points: L.LatLng[][] = [];
        this.roadGroups.forEach(rg => {
            points.push(rg.points);
        });

        return points;
    }

    public GetSignificantPoint(): L.LatLng {
        return this.roadGroups[0].points[0];
    }

    private GenerateUMLDiagram(): string {
        let umlComplete = "@startuml\n";
        this.roadGroups.forEach(rg => {
            umlComplete += rg.GenerateUMLNodes();
        });
        umlComplete += "@enduml";
        return umlComplete;
    }

    private JoinIsolated() {
        let isolated = this.FindIsolated();

        isolated.forEach(iso => {
            let minDistanceVals: [number, number];
            let minRoadGroup: RoadGroup;
            this.roadGroups.forEach(rg => {
                if (iso === rg)
                    return; // NOTE: Works like 'continue' in for loop
                if (iso.IsGroupNext(rg))
                    return;
                
                let distanceVals = rg.GetNearestPoint(iso.points[0]);
                if (minDistanceVals === undefined || distanceVals[0] < minDistanceVals[0]) {
                    minDistanceVals = distanceVals;
                    minRoadGroup = rg;
                }
                distanceVals = rg.GetNearestPoint(iso.points[iso.points.length-1]);
                if (minDistanceVals === undefined || distanceVals[0] < minDistanceVals[0]) {
                    minDistanceVals = distanceVals;
                    minRoadGroup = rg;
                    iso.SwapPointOrder();
                }
            });
            if (minDistanceVals[0] > 1) {
                // console.log(iso.id, minDistanceVals[0]);
                return;
            }
            minRoadGroup.AddNextGroup(iso, minDistanceVals[1]);
            iso.AddPrevGroup(minRoadGroup);
        });
    }

    // TODO: Make it run in a *smart* loop, so it catches every hole and refreshes its state
    private JoinHierarchies() {
        let noParent = this.FindNoParent();
        let minDistance: number;
        let minGroupAChild: RoadGroup;
        let minGroupB: RoadGroup;
        let minGroupBChild: RoadGroup;
        let minIndexA: number;
        let minIndexChild: number;

        for (let i = 0; i < noParent.length-1; i++) {
            const groupA = noParent[i];
            let extremesA: [L.LatLng, RoadGroup, number][] = [];
            groupA.GetExtremePoints(extremesA);

            for (let j = i+1; j < noParent.length; j++) {
                const groupB = noParent[j];
                let extremesB: [L.LatLng, RoadGroup, number][] = [];
                groupB.GetExtremePoints(extremesB);

                for (let k = 0; k < extremesA.length; k++) {
                    const pointAVals = extremesA[k];
                    for (let l = 0; l < extremesB.length; l++) {
                        const pointBVals = extremesB[l];
                        let distance = RoadGroup.CalcPointsDistance(pointAVals[0], pointBVals[0]);
                        if (minDistance === undefined || distance < minDistance) {
                            minDistance = distance;
                            minGroupAChild = pointAVals[1];
                            minGroupB = groupB;
                            minGroupBChild = pointBVals[1];
                            minIndexA = pointAVals[2];
                            minIndexChild = pointBVals[2];
                        }
                    }
                }
            }
        }
        // NOTE: Debug info
        // console.log("");
        // console.log("hiera merge:", groupA.id, groupB.id);
        // console.log("thru:", minGroupAChild.id, minGroupBChild.id);
        minGroupAChild.AddNextGroup(minGroupBChild, minIndexA, minIndexChild);
        minGroupBChild.AddPrevGroup(minGroupAChild);
        // Transform prevs to nexts
        minGroupBChild.NextFixNG(minGroupB);
    }

    public GenerateChartPoints(): [L.LatLng[], number[]] {
        return this.rootGroup.GetUndupedRoute();
    }

    private FindIsolated(): RoadGroup[] {
        return this.roadGroups.filter((rg) => {
            return rg.GetPrevCount() == 0 && rg.GetNextCount() == 0;
        });
    }

    private FindNoParent(): RoadGroup[] {
        return this.roadGroups.filter((rg) => {
            return rg.GetPrevCount() == 0;
        });
    }
}