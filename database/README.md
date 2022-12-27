# Nastavení databáze

### Vytvoření databáze

```sql
CREATE DATABASE map_data WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'en_US.utf8';
```

## Po připojení do databáze

### Povolení PostGISu

```sql
CREATE EXTENSION postgis;
SELECT postgis_full_version();
```

### Vytvoření tabulek

```sql
CREATE TABLE IF NOT EXISTS "map_data_index" (
    id serial PRIMARY KEY,
    nazevtrasy varchar(200),
    color varchar (50),
    weight int,
    opacity float,
    smooth_factor float,
    lineator boolean DEFAULT false,
    tags varchar(200)
);

CREATE TABLE IF NOT EXISTS "map_routes" (
    gid serial PRIMARY KEY,
    idtrasy int,
    id varchar(200),
    popis varchar(200),
    rokzameren varchar(200),
    zkratka varchar(200),
    geom geometry('LINESTRINGZM', 5514, 4),
    CONSTRAINT fk_idtrasy_mr
        FOREIGN KEY(idtrasy)
            REFERENCES map_data_index(id)
);

CREATE TABLE IF NOT EXISTS "map_lineators" (
    id serial PRIMARY KEY,
        idtrasy int NOT NULL,
        parent_gid int,
        child_gid int,
        point_index int,
        connect_index int,
        CONSTRAINT fk_idtrasy_ml
            FOREIGN KEY(idtrasy)
                REFERENCES map_data_index(id)
);

CREATE TABLE IF NOT EXISTS "osm_data_index" (
    relcislo int PRIMARY KEY,
    id varchar(6),
    nazevtrasy varchar(200),
    color varchar(50),
    weight int,
    opacity float,
    smooth_factor float,
    tags varchar(200)
);

CREATE TABLE IF NOT EXISTS "osm_rails" (
    gid serial PRIMARY KEY,
    relcislo int,
    geom geometry('LINESTRING', 4326, 2),
    CONSTRAINT fk_relcislo_osm
        FOREIGN KEY(relcislo)
            REFERENCES osm_data_index(relcislo)
);

CREATE TABLE IF NOT EXISTS "processed_data_index" (
    id serial PRIMARY KEY,
    nazevtrasy varchar(200)
);

CREATE TABLE IF NOT EXISTS "processed_routes" (
    gid serial PRIMARY KEY,
    idtrasy int,
    geom geometry('LINESTRINGZ', 5514, 4),
    relcislo int,
    CONSTRAINT fk_idtrasy_pr
        FOREIGN KEY(idtrasy)
            REFERENCES processed_data_index(id),
    CONSTRAINT fk_relcislo_pr
            FOREIGN KEY(relcislo)
                REFERENCES osm_data_index(relcislo)
);

CREATE TABLE IF NOT EXISTS "processed_routes_line" (
    gid serial PRIMARY KEY,
    geom geometry('LINESTRINGZ', 5514, 4),
    relcislo int,
    CONSTRAINT fk_relcislo_prline
            FOREIGN KEY(relcislo)
                REFERENCES osm_data_index(relcislo)
);
```

### Nastavení vlastnictví tabulek

```sql
ALTER TABLE nazev_tabulky OWNER TO railway_map;
```

### Skripty pro naplnění daty

- [Shellový skript pro navedení shapefile do DB](convert-postgis.sh)
    - Závisí na programu [shp2pgsql](https://www.bostongis.com/pgsql2shp_shp2pgsql_quickguide.bqg)
    - Vytvoří *.sql* soubor
    - Defaultně bude vkládat do tabulek *map_data_index* a *map_routes* (lze změnit)
    - [Ukázka výstupu](convert_output_example.sql)

- [Python skript pro stažení dat železničních dat z OSM do DB](osm_overpass.py)

### Skript pro převedení surových dat na co nejspojitější cesty
> Pro další zpracování
```sql
DO $$
DECLARE
    myid int;
BEGIN

INSERT INTO "processed_data_index" (nazevtrasy)
VALUES ('Olc_Krn_Ova_Z') RETURNING id INTO myid;

INSERT INTO processed_routes (idtrasy, geom)
SELECT myid AS idtrasy, (dump).geom AS geom FROM
(
    SELECT ST_Dump(ST_LineMerge(ST_Collect(geom))) AS dump
    FROM map_routes
    WHERE idtrasy = 1
) AS linestring_dump;

CREATE INDEX ON "processed_routes" USING GIST ("geom");

END $$
```

### Další pracovní soubory (užitečné info)

- [QGIS soubor se zpracovanými tratěmi](db_cleanup_qgis.qgz)