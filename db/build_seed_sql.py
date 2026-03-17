#!/usr/bin/env python3
"""
build_seed_sql.py
Reads the 4 CSV files from ../csv-files/ and produces scorekort_seed.sql
with INSERT statements for all tables.

Usage:
    cd db/
    python3 build_seed_sql.py
"""

import csv
import os
from pathlib import Path

CSV_DIR = Path(__file__).parent.parent / "csv-files"
OUTPUT = Path(__file__).parent / "scorekort_seed.sql"


def esc(val: str) -> str:
    """Escape a string for SQLite insertion."""
    if val is None:
        return "NULL"
    val = val.strip()
    if val == "":
        return "NULL"
    return "'" + val.replace("'", "''") + "'"


def num(val: str, as_real: bool = False):
    """Convert to number or NULL."""
    if val is None:
        return "NULL"
    val = val.strip().rstrip(",")
    if val == "":
        return "NULL"
    try:
        if as_real:
            return str(float(val))
        return str(int(val))
    except ValueError:
        try:
            return str(float(val))
        except ValueError:
            return "NULL"


def read_csv(filename: str):
    """Read a CSV file and return rows as dicts."""
    path = CSV_DIR / filename
    with open(path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        return list(reader)


def build_clubs(out, rows):
    out.write("-- Clubs\n")
    for r in rows:
        out.write(
            f"INSERT INTO clubs (club_id, club_name, address, city, postal_code, state, country, latitude, longitude, website, email, telephone, continent) "
            f"VALUES ({num(r['ClubID'])}, {esc(r['ClubName'])}, {esc(r['Address'])}, {esc(r['City'])}, "
            f"{esc(r['PostalCode'])}, {esc(r.get('State', ''))}, {esc(r['Country'])}, "
            f"{num(r['Latitude'], True)}, {num(r['Longitude'], True)}, "
            f"{esc(r['Website'])}, {esc(r['Email'])}, {esc(r['Telephone'])}, {esc(r['Continent'])});\n"
        )
    out.write("\n")


def build_courses_and_holes(out, rows):
    out.write("-- Courses and Holes\n")
    for r in rows:
        club_id = num(r["ClubID"])
        course_id = num(r["CourseID"])
        course_name = esc(r["CourseName"])
        num_holes_val = num(r["NumHoles"])
        measure = num(r["MeasureMeters"])
        ts = num(r.get("TimestampUpdated", ""))

        out.write(
            f"INSERT INTO courses (course_id, club_id, course_name, num_holes, measure_meters, timestamp_updated) "
            f"VALUES ({course_id}, {club_id}, {course_name}, {num_holes_val}, {measure}, {ts});\n"
        )

        # Extract how many holes this course actually has
        n = int(r["NumHoles"]) if r["NumHoles"].strip() else 18

        for h in range(1, n + 1):
            par_val = num(r.get(f"Par{h}", ""))
            hcp_val = num(r.get(f"Hcp{h}", ""))
            par_w = num(r.get(f"ParW{h}", ""))
            hcp_w = num(r.get(f"HcpW{h}", ""))
            match_idx = num(r.get(f"MatchIndex{h}", ""))
            split_idx = num(r.get(f"SplitIndex{h}", ""))

            out.write(
                f"INSERT INTO holes (course_id, hole_no, par, hcp, par_w, hcp_w, match_index, split_index) "
                f"VALUES ({course_id}, {h}, {par_val}, {hcp_val}, {par_w}, {hcp_w}, {match_idx}, {split_idx});\n"
            )

    out.write("\n")


def build_tees_and_lengths(out, rows):
    out.write("-- Tees and Tee Lengths\n")
    # Track seen tee_keys to handle duplicates
    seen_keys = {}

    for idx, r in enumerate(rows):
        course_id_str = r["CourseID"].strip().rstrip(",")
        tee_id_str = r["TeeID"].strip().rstrip(",")

        # Build a unique tee_key
        base_key = f"{course_id_str}_{tee_id_str}"
        if base_key in seen_keys:
            seen_keys[base_key] += 1
            tee_key = f"{base_key}_{seen_keys[base_key]}"
        else:
            seen_keys[base_key] = 0
            tee_key = base_key

        course_id = num(course_id_str)
        tee_name = esc(r.get("TeeName", ""))
        tee_color = esc(r.get("TeeColor", ""))
        measure_unit = esc(r.get("MeasureUnit", "m"))

        out.write(
            f"INSERT INTO tees (tee_key, course_id, tee_external_id, tee_name, tee_color, "
            f"slope, slope_front9, slope_back9, cr, cr_front9, cr_back9, "
            f"slope_women, slope_women_front9, slope_women_back9, cr_women, cr_women_front9, cr_women_back9, "
            f"measure_unit) VALUES ("
            f"{esc(tee_key)}, {course_id}, {esc(tee_id_str)}, {tee_name}, {tee_color}, "
            f"{num(r.get('Slope',''), True)}, {num(r.get('SlopeFront9',''), True)}, {num(r.get('SlopeBack9',''), True)}, "
            f"{num(r.get('CR',''), True)}, {num(r.get('CRFront9',''), True)}, {num(r.get('CRBack9',''), True)}, "
            f"{num(r.get('SlopeWomen',''), True)}, {num(r.get('SlopeWomenFront9',''), True)}, {num(r.get('SlopeWomenBack9',''), True)}, "
            f"{num(r.get('CRWomen',''), True)}, {num(r.get('CRWomenFront9',''), True)}, {num(r.get('CRWomenBack9',''), True)}, "
            f"{measure_unit});\n"
        )

        # Insert tee_lengths for holes 1..18
        for h in range(1, 19):
            length_val = r.get(f"Length{h}", "")
            if length_val is not None:
                length_val = length_val.strip().rstrip(",")
            if length_val:
                out.write(
                    f"INSERT INTO tee_lengths (tee_key, hole_no, length) "
                    f"VALUES ({esc(tee_key)}, {h}, {num(length_val)});\n"
                )

    out.write("\n")


def build_pois(out, rows):
    out.write("-- POIs (GPS Points of Interest)\n")
    for r in rows:
        course_id = num(r["CourseID"])
        hole_no = num(r["Hole"])
        poi = esc(r["POI"])
        location = esc(r.get("Location", ""))
        side = esc(r.get("SideOfFairway", ""))
        lat = num(r.get("Latitude", ""), True)
        lon = num(r.get("Longitude", ""), True)

        out.write(
            f"INSERT INTO pois (course_id, hole_no, poi, location, side_of_fairway, latitude, longitude) "
            f"VALUES ({course_id}, {hole_no}, {poi}, {location}, {side}, {lat}, {lon});\n"
        )
    out.write("\n")


def main():
    print("Reading CSVs...")
    clubs = read_csv("clubs.csv")
    courses = read_csv("courses.csv")
    tees = read_csv("tees.csv")
    coordinates = read_csv("coordinates.csv")

    print(f"  clubs: {len(clubs)} rows")
    print(f"  courses: {len(courses)} rows")
    print(f"  tees: {len(tees)} rows")
    print(f"  coordinates: {len(coordinates)} rows")

    # Build set of valid course IDs for POI filtering
    valid_course_ids = {r["CourseID"].strip() for r in courses}

    with open(OUTPUT, "w", encoding="utf-8") as out:
        out.write("-- score-kort.dk — Seed Data\n")
        out.write("-- Generated by build_seed_sql.py from CSV files\n")
        out.write("-- DO NOT EDIT MANUALLY\n\n")
        out.write("PRAGMA foreign_keys = OFF;\n\n")

        build_clubs(out, clubs)
        build_courses_and_holes(out, courses)
        build_tees_and_lengths(out, tees)

        # Filter POIs to only include courses that exist
        valid_coords = [r for r in coordinates if r["CourseID"].strip() in valid_course_ids]
        skipped = len(coordinates) - len(valid_coords)
        if skipped:
            print(f"  Skipped {skipped} POIs referencing non-existent courses")
        build_pois(out, valid_coords)

        out.write("PRAGMA foreign_keys = ON;\n")

    print(f"Written to {OUTPUT}")
    print(f"File size: {os.path.getsize(OUTPUT) / 1024:.1f} KB")


if __name__ == "__main__":
    main()
