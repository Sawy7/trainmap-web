DO $$
DECLARE
	myid int;
BEGIN
CREATE TABLE IF NOT EXISTS "processed_data_index" (
        id serial PRIMARY KEY,
        nazevtrasy varchar(200)
);

CREATE TABLE IF NOT EXISTS "processed_routes" (
        gid serial PRIMARY KEY,
        idtrasy int,
        geom geometry('LINESTRINGZ', 5514, 4),
        CONSTRAINT fk_idtrasy
                FOREIGN KEY(idtrasy)
                        REFERENCES processed_data_index(id)
);

INSERT INTO "processed_data_index" (nazevtrasy) VALUES ('Olc_Krn_Ova_Z') RETURNING id INTO myid;
INSERT INTO processed_routes (idtrasy, geom)
SELECT myid AS idtrasy, (dump).geom AS geom FROM
(
        SELECT ST_Dump(ST_LineMerge(ST_Collect(geom))) AS dump
        FROM map_routes
        WHERE idtrasy = 1
) AS linestring_dump;
CREATE INDEX ON "processed_routes" USING GIST ("geom");
END $$
