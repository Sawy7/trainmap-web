import requests
import psycopg2

class Rail:
    def __init__(self, num, relnum, name, ml):
        self.num = num
        self.relnum = relnum
        self.name = name
        self.multiline = ml

    def insert_rail(self, conn):
        for l in multiline.lines:
            l.make_insert(self.relnum, conn)

    def insert_index(self, conn):
        cur = conn.cursor()
        cur.execute("INSERT INTO osm_data_index (id, relcislo, nazevtrasy) VALUES (%s, %s, %s);", (self.num, self.relnum, self.name))
        conn.commit()
        cur.close()

class Line:
    def __init__(self):
        self.points = []
    
    def add_point(self, lat, lon):
        self.points.append((lat, lon))

    def make_insert(self, relnum, conn):
        geom = "ST_MakeLine(ARRAY["
        for p in self.points:
            geom += f"ST_Point({p[1]},{p[0]},4326),"
        geom = geom[:-1]+ "])"
        
        cur = conn.cursor()
        cur.execute(f"INSERT INTO osm_rails (relcislo, geom) VALUES (%s, {geom});", (relnum, ))
        conn.commit()
        cur.close()

class MultiLine:
    def __init__(self):
        self.lines = []

    def add_line(self, line):
        self.lines.append(line)

    def parse_ways(self, ways_array):
        for way in ways_array:
            line = Line()
            if way["type"] != "way":
                print("WARN: This is not a way, yet it is in a parsing loop")
                continue
            for point in way["geometry"]:
                line.add_point(point["lat"], point["lon"])
            self.add_line(line)

static_api = "https://www.openstreetmap.org/api/0.6"
overpass_api = "https://lz4.overpass-api.de/api/interpreter"

def get_relation(id):
    response = requests.get(url=f"{static_api}/relation/{id}.json")
    if response.status_code == 200:
        return response.json()["elements"][0]
    else:
        return get_relation(id)

def get_relation_ways(id):
    query = f"""
        [out:json];
        (
            relation({id});
        );
        out geom;
    """
    response = requests.post(url=overpass_api, data=query)
    if response.status_code == 200:
        return response.json()["elements"][0]
    else:
        return get_relation_ways(id)

def create_table(conn):
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS osm_data_index ( \
        relcislo integer PRIMARY KEY, id varchar(6), nazevtrasy varchar(200), \
        color varchar(50), weight integer, opacity float, smooth_factor float, tags varchar(200) \
    );")
    cur.execute("CREATE TABLE IF NOT EXISTS osm_rails (gid serial PRIMARY KEY, relcislo integer, geom geometry('LINESTRING', 4326, 2), CONSTRAINT fk_cislo FOREIGN KEY(relcislo) REFERENCES osm_data_index(relcislo));")
    conn.commit()
    cur.close()

def check_if_exists(id, conn):
    cur = conn.cursor()
    cur.execute("SELECT * FROM osm_data_index WHERE relcislo = %s;", (id, ))
    row_count = cur.rowcount
    cur.close()
    return row_count > 0

def update_data_defaults(conn):
    cur = conn.cursor()
    cur.execute("UPDATE osm_data_index SET \
        color = 'green', weight = 5, opacity = 0.5, \
        smooth_factor = 1 \
        WHERE color IS NULL")
    conn.commit()
    cur.close()

def create_index(conn):
    cur = conn.cursor()
    cur.execute("CREATE INDEX ON osm_rails USING GIST (geom);")
    conn.commit()
    cur.close()

if __name__ == "__main__":
    conn = psycopg2.connect("dbname='map_data' user='postgres' password='mysecretpassword' host='localhost'")
    create_table(conn)
    
    # Getting the parent relation
    # parent = get_relation(12430550)
    parent = get_relation(2332889)
    relation_len = len(parent["members"])
    for i,e in enumerate(parent["members"]):
        if check_if_exists(e["ref"], conn):
            print(f"Skipping relation {e['ref']} ⏰")
            continue
        ways = get_relation_ways(e["ref"])
        if "abandoned" in ways["tags"] and ways["tags"]["abandoned"] == "yes":
            print(f"Skipping abandoned relation {e['ref']} 🏚️")
            continue
        multiline = MultiLine()
        multiline.parse_ways(ways["members"])
        if "ref" not in ways["tags"] or ways["tags"]["ref"] == "-":
            ways["tags"]["ref"] = None
        elif " " in ways["tags"]["ref"]:
            ways["tags"]["ref"] = int(ways["tags"]["ref"].replace(" ", ""))
        rail = Rail(ways["tags"]["ref"], e["ref"], ways["tags"]["name"], multiline)
        rail.insert_index(conn)
        rail.insert_rail(conn)
        print(f"Rail {ways['tags']['ref']} ✅ ({i+1}/{relation_len})")

    update_data_defaults(conn)
    create_index(conn)
    conn.close()