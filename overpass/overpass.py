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
            l.make_insert(self.num, conn)

    def insert_index(self, conn):
        cur = conn.cursor()
        cur.execute("INSERT INTO osm_data_index (cislo, relcislo, nazev) VALUES (%s, %s, %s);", (self.num, self.relnum, self.name))
        conn.commit()
        cur.close()

class Line:
    def __init__(self):
        self.points = []
    
    def add_point(self, lat, lon):
        self.points.append((lat, lon))

    def make_insert(self, num, conn):
        geom = "ST_MakeLine(ARRAY["
        for p in self.points:
            geom += f"ST_Point({p[1]},{p[0]},4326),"
        geom = geom[:-1]+ "])"
        
        cur = conn.cursor()
        cur.execute(f"INSERT INTO osm_rails (cislo, geom) VALUES (%s, {geom});", (num, ))
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
    response = requests.get(url=f"{static_api}/relation/{id}.json") # 12430550
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
    cur.execute("CREATE TABLE IF NOT EXISTS osm_data_index (cislo integer PRIMARY KEY, relcislo integer, nazev varchar(200));")
    cur.execute("CREATE TABLE IF NOT EXISTS osm_rails (id serial PRIMARY KEY, cislo integer, geom geometry('LINESTRING', 4326, 2), CONSTRAINT fk_cislo FOREIGN KEY(cislo) REFERENCES osm_data_index(cislo));")
    conn.commit()
    cur.close()

def check_if_exists(id, conn):
    cur = conn.cursor()
    cur.execute("SELECT * FROM osm_data_index WHERE relcislo = %s;", (id, ))
    row_count = cur.rowcount
    cur.close()
    return row_count > 0

if __name__ == "__main__":
    conn = psycopg2.connect("dbname='map_data' user='postgres' password='mysecretpassword' host='localhost'")
    create_table(conn)
    
    # Getting the parent relation
    parent = get_relation(12430550)
    relation_len = len(parent["members"])
    for i,e in enumerate(parent["members"]):
        if check_if_exists(e["ref"], conn):
            print(f"Skipping relation {e['ref']} ⏰")
            continue
        ways = get_relation_ways(e["ref"])
        multiline = MultiLine()
        multiline.parse_ways(ways["members"])
        if "ref" not in ways["tags"] or ways["tags"]["ref"] == "-":
            ways["tags"]["ref"] = int(ways["tags"]["name"].split(" ")[0])
        elif " " in ways["tags"]["ref"]:
            ways["tags"]["ref"] = int(ways["tags"]["ref"].replace(" ", ""))
        elif ways["tags"]["operator"] == "cz:JHMD": # TODO: Make a better rule
            continue
        rail = Rail(ways["tags"]["ref"], e["ref"], ways["tags"]["name"], multiline)
        rail.insert_index(conn)
        rail.insert_rail(conn)
        print(f"Rail {ways['tags']['ref']} ✅ ({i+1}/{relation_len})")

    conn.close()