-- score-kort.dk — Database Schema
-- Target: Cloudflare D1 (SQLite)

DROP TABLE IF EXISTS change_requests;
DROP TABLE IF EXISTS pois;
DROP TABLE IF EXISTS tee_lengths;
DROP TABLE IF EXISTS tees;
DROP TABLE IF EXISTS holes;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS clubs;

-- ============================================================
-- Clubs
-- ============================================================
CREATE TABLE clubs (
  club_id       INTEGER PRIMARY KEY,
  club_name     TEXT    NOT NULL,
  address       TEXT,
  city          TEXT,
  postal_code   TEXT,
  state         TEXT,
  country       TEXT    DEFAULT 'Denmark',
  latitude      REAL,
  longitude     REAL,
  website       TEXT,
  email         TEXT,
  telephone     TEXT,
  continent     TEXT    DEFAULT 'Europe'
);

CREATE INDEX idx_clubs_name ON clubs(club_name);
CREATE INDEX idx_clubs_city ON clubs(city);

-- ============================================================
-- Courses
-- ============================================================
CREATE TABLE courses (
  course_id         INTEGER PRIMARY KEY,
  club_id           INTEGER NOT NULL REFERENCES clubs(club_id),
  course_name       TEXT    NOT NULL,
  num_holes         INTEGER NOT NULL DEFAULT 18,
  measure_meters    INTEGER DEFAULT 1,
  timestamp_updated INTEGER
);

CREATE INDEX idx_courses_club ON courses(club_id);

-- ============================================================
-- Holes (one row per course + hole number)
-- ============================================================
CREATE TABLE holes (
  course_id     INTEGER NOT NULL REFERENCES courses(course_id),
  hole_no       INTEGER NOT NULL,
  par           INTEGER,
  hcp           INTEGER,
  par_w         INTEGER,
  hcp_w         INTEGER,
  match_index   INTEGER,
  split_index   INTEGER,
  PRIMARY KEY (course_id, hole_no)
);

-- ============================================================
-- Tees
-- tee_key is the stable PK because TeeID can be duplicated
-- ============================================================
CREATE TABLE tees (
  tee_key           TEXT    PRIMARY KEY,
  course_id         INTEGER NOT NULL REFERENCES courses(course_id),
  tee_external_id   TEXT,
  tee_name          TEXT,
  tee_color         TEXT,
  slope             REAL,
  slope_front9      REAL,
  slope_back9       REAL,
  cr                REAL,
  cr_front9         REAL,
  cr_back9          REAL,
  slope_women       REAL,
  slope_women_front9 REAL,
  slope_women_back9 REAL,
  cr_women          REAL,
  cr_women_front9   REAL,
  cr_women_back9    REAL,
  measure_unit      TEXT    DEFAULT 'm'
);

CREATE INDEX idx_tees_course ON tees(course_id);

-- ============================================================
-- Tee Lengths (one row per tee + hole)
-- ============================================================
CREATE TABLE tee_lengths (
  tee_key   TEXT    NOT NULL REFERENCES tees(tee_key),
  hole_no   INTEGER NOT NULL,
  length    INTEGER,
  PRIMARY KEY (tee_key, hole_no)
);

-- ============================================================
-- POIs (GPS points of interest per course/hole)
-- ============================================================
CREATE TABLE pois (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id       INTEGER NOT NULL REFERENCES courses(course_id),
  hole_no         INTEGER NOT NULL,
  poi             TEXT    NOT NULL,
  location        TEXT,
  side_of_fairway TEXT,
  latitude        REAL,
  longitude       REAL
);

CREATE INDEX idx_pois_course_hole ON pois(course_id, hole_no);

-- ============================================================
-- Change Requests (user-submitted corrections)
-- ============================================================
CREATE TABLE change_requests (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  type          TEXT    NOT NULL,
  status        TEXT    NOT NULL DEFAULT 'NEW',
  club_id       INTEGER,
  course_id     INTEGER,
  tee_key       TEXT,
  user_message  TEXT,
  user_contact  TEXT,
  admin_notes   TEXT
);

CREATE INDEX idx_change_requests_status ON change_requests(status);
