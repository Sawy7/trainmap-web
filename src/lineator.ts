import { RoadGroup } from "./roadgroup";
import { SingleMapRoad } from "./singleroad";

export class Lineator {
    private roadGroups: RoadGroup[];
    public constructedRoads: SingleMapRoad[] = [];

    constructor(roadGroups: RoadGroup[]) {
        this.roadGroups = roadGroups;
        this.PopulateIntersects();
        
        console.log("isolated count:", this.FindIsolated().length);
        this.JoinIsolated();

        // TODO: Cleanup
        // this.JoinFinal();
        this.JoinHierarchies();
        let noParent = this.FindNoParent();
        noParent.forEach(rg => {
            let randomColor = "#" + Math.floor(Math.random()*16777215).toString(16);
            this.constructedRoads.push(rg.JoinIntersects());
        });
        this.roadGroups.forEach(element => {
            // console.log("visited:", element.visited);
        });
        console.log("nopar count:", noParent.length);
        console.log("all groups count:", this.roadGroups.length);

        // console.log(this.GenerateUMLDiagram());
    }

    private GenerateUMLDiagram(): string {
        let umlComplete = "@startuml\n";
        this.roadGroups.forEach(rg => {
            umlComplete += rg.GenerateUMLNodes();
        });
        umlComplete += "@enduml";
        return umlComplete;
    }

    private PopulateIntersects() {
        this.roadGroups.forEach(groupA => {
            this.roadGroups.forEach(groupB => {
                if (groupA === groupB) 
                    return; // NOTE: Works like 'continue' in for loop
                if (groupB.IsGroupNext(groupA) || groupB.SetAndCheckThisNext())
                    return;

                for (let i = 0; i < groupA.points.length; i++) {
                    if (groupB.points[0].lat == groupA.points[i].lat &&
                        groupB.points[0].lng == groupA.points[i].lng
                    ) {
                        groupA.AddNextGroup(groupB, i);
                        groupB.AddPrevGroup(groupA);
                    }
                }
            });
        });
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
                // if (iso.id == 635 && rg.id == 679) {
                //     console.log("mindissearch", minDistanceVals[0]);
                // }
            });
            // console.log("mindistance:", minDistanceVals[0]);
            if (minDistanceVals[0] > 3)
                return;
            minRoadGroup.AddNextGroup(iso, minDistanceVals[1]);
            iso.AddPrevGroup(minRoadGroup);
        });
    }

    // TODO: Make it run in a *smart* loop, so it catches every hole and refreshes its state
    private JoinHierarchies() {
        let noParent = this.FindNoParent();
        // let toAddDelayed: [RoadGroup, RoadGroup, number, number][] = [];
        // let minDistances: number[] = [];
        // let minChilds: number[] = [];

        for (let i = 0; i < noParent.length-1; i++) {
            const groupA = noParent[i];
            let extremesA: [L.LatLng, RoadGroup, number][] = [];
            groupA.GetExtremePoints(extremesA);

            let minDistance: number;
            let minGroupAChild: RoadGroup;
            let minGroupBChild: RoadGroup;
            let minIndexA: number;
            let minIndexChild: number;

            for (let j = i+1; j < noParent.length; j++) {
                const groupB = noParent[j];
                let extremesB: [L.LatLng, RoadGroup, number][] = [];
                groupB.GetExtremePoints(extremesB);

                let groupsMatchedAlready = false;
                for (let k = 0; k < extremesA.length; k++) {
                    const pointAVals = extremesA[k];
                    for (let l = 0; l < extremesB.length; l++) {
                        const pointBVals = extremesB[l];
                        let distance = RoadGroup.CalcPointsDistance(pointAVals[0], pointBVals[0]);
                        if (minDistance === undefined || distance < minDistance) {
                            minDistance = distance;
                            minGroupAChild = pointAVals[1];
                            minGroupBChild = pointBVals[1];
                            minIndexA = pointAVals[2];
                            minIndexChild = pointBVals[2];

                            if (minDistance < 3) {
                                console.log("");
                                console.log("hiera merge:", groupA.id, groupB.id);
                                console.log("thru:", minGroupAChild.id, minGroupBChild.id);
                                console.log("distance:", minDistance);
                                minGroupAChild.AddNextGroup(minGroupBChild, minIndexA, minIndexChild);
                                minGroupBChild.AddPrevGroup(minGroupAChild);
                                // // Transform prevs to nexts
                                minGroupBChild.NextFixNG(groupB);
                                groupsMatchedAlready = true;
                                break;
                            }
                        }
                    }
                    if (groupsMatchedAlready)
                        break;
                }
            }
        }
    }

    private JoinFinal() {
        let noParent = this.FindNoParent();
        // let toAddDelayed: [RoadGroup, RoadGroup, number, number][] = [];
        // let minDistances: number[] = [];
        // let minChilds: number[] = [];

        for (let i = 0; i < noParent.length-1; i++) {
            const groupA = noParent[i];
            let extremesA: [L.LatLng, RoadGroup, number][] = [];
            groupA.GetExtremePoints(extremesA);

            let minDistance: number;
            let minGroupAChild: RoadGroup;
            let minGroupBChild: RoadGroup;
            let minIndexA: number;
            let minIndexChild: number;

            for (let j = i+1; j < noParent.length; j++) {
                const groupB = noParent[j];
                // if (groupB.IsGroupMerged()) {
                //     continue;
                // }
                let extremesB: [L.LatLng, RoadGroup, number][] = [];
                groupB.GetExtremePoints(extremesB);

                extremesA.forEach(pointAVals => {
                    extremesB.forEach(pointBVals => {
                        let distance = RoadGroup.CalcPointsDistance(pointAVals[0], pointBVals[0]);
                        if (minDistance === undefined || distance < minDistance) {
                            minDistance = distance;
                            minGroupAChild = pointAVals[1];
                            minGroupBChild = pointBVals[1];
                            minIndexA = pointAVals[2];
                            minIndexChild = pointBVals[2];

                            if (minDistance < 3) {
                                console.log(minDistance);
                                minGroupAChild.AddNextGroup(minGroupBChild, minIndexA, minIndexChild);
                                minGroupBChild.AddPrevGroup(minGroupAChild);
                                console.log("something happening here");
                                // Transform prevs to nexts
                                minGroupBChild.NextFixNG(groupB);
                            } else {
                            }
                        }
                    });
                });
            }

            if (minDistance < 100) {
                // minDistances.push(minDistance);
                // minChilds.push(minIndexChild);
                
                // toAddDelayed.push([minGroupAChild, minGroupBChild, minIndexA, minIndexChild]);
                // minGroupBChild.merged = true;

                // minGroupAChild.AddNextGroup(minGroupBChild, minIndexA, minIndexChild);
                // minGroupBChild.AddPrevGroup(minGroupAChild);
            } else {
                // console.log(minDistance);
                // console.log(minIndexA, minIndexChild);
            }

            // if (minDistance2 < 100) {
            //     toAddDelayed.push([minGroupAChild2, minGroupBChild2, minIndexA2, minIndexChild2]);
            //     minGroupBChild2.merged = true;
            // }
        }

        // toAddDelayed.forEach(batch => {
        //     batch[0].AddNextGroup(batch[1], batch[2], batch[3]);
        //     batch[1].AddPrevGroup(batch[0]);
        // });
        // minDistances.forEach(dist => {
        //     console.log(dist);
        // });
        // for (let i = 0; i < minChilds.length; i++) {
        //     const minIndexChild = minChilds[i];
        //     const minIndexA = toAddDelayed[i][2];
        //     console.log("indexes:", minIndexA, minIndexChild);
        //     console.log("groups", toAddDelayed[i][0].id, toAddDelayed[i][1].id);
        // }
    }

    private FindIsolated(): RoadGroup[] {
        return this.roadGroups.filter((rg) => {
            return rg.GetPrevCount() == 0 && rg.GetNextCount() == 0;
        });
    }

    private FindNoParent(): RoadGroup[] {
        return this.roadGroups.filter((rg) => {
            return rg.GetPrevCount() == 0 && rg.GetNextCount() > 0;
        });
    }
}