from math import sqrt
import sys

class Group:
    id_gen = -1

    def __init__(self):
        Group.id_gen += 1
        self.id = Group.id_gen
        self.next = []
        self.prev = []
        self.coords_array = []
        self.intersects = []

    def append(self, coords):
        self.coords_array.append(coords)

    def render(self):
        for coords in self.coords_array:
            print(f'{coords[0]},{coords[1]},red,marker,"First"')

    def assign_next(self, id):
        self.next.append(id)

    def assign_prev(self, id):
        self.prev.append(id)

    def add_intersect(self, index):
        self.intersects.append(index)
    
    def join_intersects(self, double_up = False, previously_visited = [], coord_count = 0):
        previously_visited.append(self.id)
        if not double_up:
            print('let py = new MapLayer("Python DUMP");')
            print('py.AddMapRoad(new SingleMapRoad([')
        for i, coord in enumerate(self.coords_array):
            for child in self.next:
                if child[2] in previously_visited:
                    continue
                elif i == child[0]:
                    previously_visited.append(child[2])
                    coord_count = child[1].join_intersects(True, previously_visited, coord_count)
                else:
                    print(f"    new L.LatLng({coord[0]}, {coord[1]}),")
                    coord_count += 1
        if double_up:
            for coord in self.coords_array[::-1]:
                print(f"    new L.LatLng({coord[0]}, {coord[1]}),")
                coord_count += 1
        if not double_up:
            print('], [')
            print('], "blue"));')
            print('app.AddMapLayer(py);')
        return coord_count

def parse_coords(line):
    coords = line.split(",")
    return [float(coords[1]), float(coords[0]), float(coords[2])]

def get_first_lat(group: Group):
    return group.coords_array[0][0]

def calc_distance(coords_a, coords_b):
    return sqrt(pow(coords_a[0]-coords_b[0], 2) + pow(coords_a[1]-coords_b[1], 2))

def calc_distance_start_end(group_a: Group, group_b: Group):
    return calc_distance(group_a.coords_array[0], group_b.coords_array[-1])

def dump_to_js(groups):
    print('let py = new MapLayer("Python DUMP");')
    print('py.AddMapRoad(new SingleMapRoad([')
    # Coords HERE
    for g in groups:
        for c in g.coords_array:
            print(f"    new L.LatLng({c[0]}, {c[1]}),")
    print('], [')
    # Eleavation HERE
    for g in groups:
        for c in g.coords_array:
            print(f"    {c[2]},")
    print('], "blue"));')
    print('app.AddMapLayer(py);')

def populate_next(groups):
    for i, a in enumerate(groups):
        if a.next != -1:
            continue
        min_distance_value = None
        for j, b in enumerate(groups):
            if i == j:
                continue
            if b.id in [x.next for x in groups]:
                continue
            # if b.next != -1:
            #     continue
            distance = calc_distance_start_end(a, b)
            if min_distance_value is None or distance < min_distance_value:
                min_distance_value = distance
                a.assign_next(b.id)

def populate_next_intersect(groups):
    for i, a in enumerate(groups):
        if a.next != -1:
            continue
        for j, b in enumerate(groups):
            if i == j:
                continue
            if b.id in [x.next for x in groups]:
                continue
            
            if b.coords_array[0] == a.coords_array[-1]:
                a.assign_next(b.id)
                b.assign_prev(a.id)

def populate_next_intersect_multi(groups):
    for i, a in enumerate(groups):
        for j, b in enumerate(groups):
            if i == j:
                continue

            # all_g_nexts = [x.next for x in groups]
            # all_nexts_flat = []
            # for g_nexts in all_g_nexts:
            #     for next in g_nexts:
            #         all_nexts_flat.append(next[2])
            
            # if b.id in all_nexts_flat:
            #     continue
            
            for k, a_coord in enumerate(a.coords_array):
                if b.coords_array[0] == a_coord:
                    a.assign_next((k, b, b.id))
                    b.assign_prev(a)

def resolve_next_dups(groups):
    for i, a in enumerate(groups):
        for j, b in enumerate(groups):
            if i == j:
                continue
            elif a.next == -1 or b.next == -1:
                continue
            elif a.next == b.next:
                distance_a = calc_distance_start_end(a, groups[a.next])
                distance_b = calc_distance_start_end(a, groups[a.next])
                if distance_a <= distance_b:
                    b.assign_next(-1)
                else:
                    a.assign_next(-1)

def next_sorted(groups, group_index, sorted_groups, initial=None):
    if groups[group_index].next == initial or groups[group_index].next == -1:
        return
    # print(f"Group {groups[group_index].id} -> {groups[group_index].next}")
    sorted_groups.append(groups[group_index])
    if initial is None:
        initial = group_index
    next_sorted(groups, groups[group_index].next, sorted_groups, initial)

def next_sorted_multi(groups, group_index, sorted_groups, initial=None):
    pass

def to_jbop(groups):
    huge_array = []
    for g in groups:
        for a in g.coords_array:
            huge_array.append(a)

    return huge_array

if __name__ == "__main__":
    path_file = open("path-data.txt", "r")

    groups = []

    current_group = Group()
    while True:
        line = path_file.readline().strip()
        if not line:
            break

        if line == "===":
            groups.append(current_group)
            current_group = Group()
            continue
        current_group.append(parse_coords(line))

    # populate_next(groups)

    # sorted_groups = []
    # next_sorted(groups, 1, sorted_groups)
    # dump_to_js(
    #     sorted_groups
    # )

    # counter = 0
    # for i, group in enumerate(groups):
    #     if group.coords_array[0] in [x.coords_array[-1] for x in groups[(i+1)::]]:
    #         counter += 1
    #     if group.coords_array[-1] in [x.coords_array[0] for x in groups[(i+1)::]]:
    #         counter += 1

    # counter = 0
    # for a in groups:
    #     for b in groups:
    #         if a == b:
    #             continue
    #         for c_a in a.coords_array:
    #                 if c_a == b.coords_array[0]:
    #                     counter += 1
    #                     a.add_intersect(c_a)
    #                     # print(f"{c_a} === {b.coords_array[0]}")

    # print("intersects", counter)
    # print("groups", len(groups))

    # populate_next_intersect(groups)
    # max_sorted_len = 0
    # max_sorted_groups = None
    # for i in range(len(groups)):
    #     sorted_groups = []
    #     next_sorted(groups, i, sorted_groups)
    #     if len(sorted_groups) > max_sorted_len:
    #         max_sorted_len = len(sorted_groups)
    #         max_sorted_groups = sorted_groups
    # for group in max_sorted_groups:
    #     print(f"Group {group.id} -> {group.next}")
    # dump_to_js(max_sorted_groups)

    populate_next_intersect_multi(groups)
    # for group in groups:
    #     # if len(group.prev) == 0 and len(group.next) != 0:
    #     print(f"Group {group.id} -> {[(x[0], x[2]) for x in group.next]}")
    #     # print(f"Group {group.prev} <- {group.id}")

    # GUD
    no_parent = [x for x in groups if len(x.prev) == 0 and len(x.next) > 0]
    for np in no_parent:
        coord_count = np.join_intersects()
        # print(coord_count, file=sys.stderr)
        print("")

    path_file.close()