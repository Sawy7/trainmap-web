import { RoadGroup } from "./roadgroup";
import { SingleMapRoad } from "./singleroad";

export class Lineator {
    private roadGroups: RoadGroup[];
    public constructedRoads: SingleMapRoad[] = [];

    constructor(roadGroups: RoadGroup[]) {
        this.roadGroups = roadGroups;
        this.PopulateIntersects();

        let noParent = this.FindNoParent();
        noParent.forEach(rg => {
            this.constructedRoads.push(rg.JoinIntersects());
        });
    }

    private PopulateIntersects() {
        this.roadGroups.forEach(groupA => {
            this.roadGroups.forEach(groupB => {
                if (groupA === groupB)
                    return; // NOTE: Works like 'continue' in for loop

                for (let i = 0; i < groupA.points.length; i++) {
                    if (groupB.points[0].lat == groupA.points[i].lat && groupB.points[0].lng == groupA.points[i].lng) {
                        groupA.AddNextGroup(groupB, i);
                        groupB.AddPrevGroup(groupA);
                    }
                }
            });
        });
    }

    private FindNoParent(): RoadGroup[] {
        return this.roadGroups.filter((rg) => {
            return rg.GetPrevCount() == 0 && rg.GetNextCount() > 0;
        });
    }
}