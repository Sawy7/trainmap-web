import { RoadGroup } from "./roadgroup";
import { SingleMapRoad } from "./singleroad";

export class Lineator {
    private roadGroups: RoadGroup[];
    public constructedRoads: SingleMapRoad[] = [];

    constructor(roadGroups: RoadGroup[]) {
        this.roadGroups = roadGroups;
        this.PopulateIntersects();
        
        this.JoinIsolated();
        
        let noParent = this.FindNoParent();
        noParent.forEach(rg => {
            this.constructedRoads.push(rg.JoinIntersects());
        });
        this.FindOdd();
        
        // this.roadGroups.forEach(element => {
        //     this.constructedRoads.push(element.GetAsSingleMapRoad());
        // });
    }

    private PopulateIntersects() {
        this.roadGroups.forEach(groupA => {
            this.roadGroups.forEach(groupB => {
                if (groupA === groupB) 
                    return; // NOTE: Works like 'continue' in for loop
                if (groupB.IsGroupNext(groupA))
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
            });
            minRoadGroup.AddNextGroup(iso, minDistanceVals[1]);
            iso.AddPrevGroup(minRoadGroup);
        });
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