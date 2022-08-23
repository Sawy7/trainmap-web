import { RoadGroup } from "./roadgroup";
import { SingleMapRoad } from "./singleroad";

export class Lineator {
    private roadGroups: RoadGroup[];
    public constructedRoads: SingleMapRoad[] = [];

    constructor(roadGroups: RoadGroup[]) {
        this.roadGroups = roadGroups;
        this.PopulateIntersects();
        
        this.JoinIsolated();

        // TODO: Cleanup
        this.JoinFinal();
        let noParent = this.FindNoParent();
        noParent.forEach(rg => {
            let randomColor = "#" + Math.floor(Math.random()*16777215).toString(16);
            this.constructedRoads.push(rg.JoinIntersects(randomColor));
        });
        this.roadGroups.forEach(element => {
            console.log("visited:", element.visited);
            // if (element.visited == 0) {
            //     console.log(element.id);
            //     console.log(element.prevGroups);
            // }
        });
        // this.FindOdd();
        console.log(noParent.length);
        console.log("all groups count: ", this.roadGroups.length);
        
        // console.log("691 summary");
        // console.log(this.roadGroups[691].nextGroups);
        // console.log(this.roadGroups[691].prevGroups);

        // console.log("690 summary");
        // console.log(this.roadGroups[690].nextGroups);
        // console.log(this.roadGroups[690].prevGroups);

        console.log(this.GenerateUMLDiagram());
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
            });
            // console.log(minDistanceVals[0]);
            minRoadGroup.AddNextGroup(iso, minDistanceVals[1]);
            iso.AddPrevGroup(minRoadGroup);
        });
    }

    public JoinFinal() {
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
                                // Transform prevs to nexts
                                // minGroupBChild.NextFixNG(groupB);
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

    private FindOdd() {
        // let odd = this.roadGroups.filter((rg) => {
        //     // let iso = this.FindIsolated();
        //     // let nopar = this.FindNoParent();
        //     // return !iso.includes(rg) && !nopar.includes(rg);
        //     return !rg.visited;
        // });

        // odd.forEach(element => {
        //     console.log("ele", element.id);
        //     element.prevGroups.forEach(ele2 => {
        //         console.log("prev", ele2.id);
        //     });
        // });
        // console.log(odd);
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