#!/bin/sh
# Remove sensitive data from git
git-filter-repo --invert-paths --path-regex parsing_dev/Olc_Krn_Ova.*
git-filter-repo --invert-paths --path parsing_dev/220817_OsyKolejiPodklady3D-corrected.ZIP
git-filter-repo --invert-paths --path parsing_dev/path-data.txt
git-filter-repo --invert-paths --path parsing_dev/sorted_coords.txt
git-filter-repo --invert-paths --path parsing_dev/log.txt
git-filter-repo --invert-paths --path parsing_dev/output.sql
git-filter-repo --invert-paths --path database/dump_08-10-2022_10_02_59.sql
git-filter-repo --invert-paths --path database/convert_output_example.sql
git-filter-repo --invert-paths --path database/dump_29-10-2022_20_04_39.sql
git-filter-repo --invert-paths --path raw_data/220817_OsyKolejiPodklady3D-corrected.ZIP
git-filter-repo --invert-paths --path database/.dump_04-11-2022_16_37_43_only_data.sql.kate-swp
git-filter-repo --invert-paths --path database/dump_04-11-2022_16_37_43_only_data.sql
git-filter-repo --invert-paths --path database/pgAdmin4_tables
git-filter-repo --invert-paths --path database/shortest
git-filter-repo --invert-paths --path raw_data/osykoleji_3d-corrected.zip
git-filter-repo --invert-paths --path raw_data/osykoleji_3d.zip
git-filter-repo --invert-paths --path database/all_stations
git-filter-repo --invert-paths --path utilities/spaced.geojson
git-filter-repo --invert-paths --path utilities/olo-opava.geojson

# Remove 'replace/refs'
git-filter-repo --replace-refs delete-no-add
git-filter-repo --replace-refs update-no-add
